"""
yatrasaathi — Guest session and voice usage access control API.
"""
import uuid
import hashlib
import time
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Header, Request, Response, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.guest import GuestSession, VoiceUsage
from app.models.user import User
from app.api.v1.auth import get_current_user, decode_token
from app.schemas.base import ResponseWrapper

router = APIRouter(prefix="/guest", tags=["Guest & Voice Access"])

MAX_FREE_GUEST_VOICE_CHATS = 2

# In-memory fast store for resilient guest session tracking
# Key: session_token -> Dict[str, Any]
GUEST_STORE: Dict[str, Dict[str, Any]] = {}
IP_RATE_STORE: Dict[str, list] = {}


class GuestSessionResponse(BaseModel):
    session_token: str
    voice_chat_count: int
    max_free_chats: int = MAX_FREE_GUEST_VOICE_CHATS
    expires_at: str
    is_authenticated: bool = False
    temporary_conversation_id: Optional[str] = None
    temporary_journey_data: Optional[Dict[str, Any]] = None


class VoiceAccessResponse(BaseModel):
    allowed: bool
    is_authenticated: bool
    voice_chat_count: int
    max_free_chats: int = MAX_FREE_GUEST_VOICE_CHATS
    requires_auth: bool = False
    message: str


class VoiceCompleteRequest(BaseModel):
    session_token: Optional[str] = None
    conversation_id: str
    turns_count: int = 1
    duration_seconds: int = 0
    journey_data: Optional[Dict[str, Any]] = None


class ConvertSessionRequest(BaseModel):
    session_token: str


def get_ip_hash(request: Request) -> str:
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    return hashlib.sha256(client_ip.encode()).hexdigest()[:16]


def get_or_create_guest_store(token: Optional[str], ip_hash: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    target_token = token.strip() if (token and token.strip()) else None

    if target_token and target_token in GUEST_STORE:
        sess = GUEST_STORE[target_token]
        if sess["expires_at"] > now:
            return sess

    # Check if this IP has an active guest session
    if not target_token:
        for k, v in GUEST_STORE.items():
            if v.get("ip_hash") == ip_hash and v["expires_at"] > now:
                return v

    new_token = target_token or f"gsess_{uuid.uuid4().hex}"
    session_data = {
        "session_token": new_token,
        "ip_hash": ip_hash,
        "voice_chat_count": 0,
        "max_free_chats": MAX_FREE_GUEST_VOICE_CHATS,
        "created_at": now,
        "expires_at": now + timedelta(days=7),
        "temporary_conversation_id": None,
        "temporary_journey_data": None,
        "voice_usages": []
    }
    GUEST_STORE[new_token] = session_data
    return session_data


@router.post("/session", response_model=ResponseWrapper[GuestSessionResponse])
async def get_or_create_session(
    request: Request,
    response: Response,
    body: Optional[Dict[str, Any]] = None,
    authorization: Optional[str] = Header(None),
    x_guest_token: Optional[str] = Header(None, alias="X-Guest-Session-Token"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves existing or creates new guest session.
    Server is the single source of truth for free voice count.
    """
    token_from_body = body.get("session_token") if body else None
    token_from_cookie = request.cookies.get("yatrasaathi_guest_token")
    requested_token = token_from_body or x_guest_token or token_from_cookie
    ip_hash = get_ip_hash(request)

    # Check if user is already authenticated
    is_auth = False
    if authorization and authorization.startswith("Bearer "):
        payload = decode_token(authorization.split(" ")[1])
        if payload:
            is_auth = True

    sess = get_or_create_guest_store(requested_token, ip_hash)
    
    # Set cookie
    response.set_cookie(
        key="yatrasaathi_guest_token",
        value=sess["session_token"],
        max_age=7 * 86400,
        httponly=False,  # Allow frontend state reconciliation
        samesite="lax",
        secure=False if settings.environment == "development" else True
    )

    data = GuestSessionResponse(
        session_token=sess["session_token"],
        voice_chat_count=0 if is_auth else sess["voice_chat_count"],
        max_free_chats=MAX_FREE_GUEST_VOICE_CHATS,
        expires_at=sess["expires_at"].isoformat(),
        is_authenticated=is_auth,
        temporary_conversation_id=sess.get("temporary_conversation_id"),
        temporary_journey_data=sess.get("temporary_journey_data")
    )
    return ResponseWrapper(data=data)


@router.get("/session", response_model=ResponseWrapper[GuestSessionResponse])
async def get_session_info(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_guest_token: Optional[str] = Header(None, alias="X-Guest-Session-Token")
):
    token_from_cookie = request.cookies.get("yatrasaathi_guest_token")
    requested_token = x_guest_token or token_from_cookie
    ip_hash = get_ip_hash(request)

    is_auth = False
    if authorization and authorization.startswith("Bearer "):
        payload = decode_token(authorization.split(" ")[1])
        if payload:
            is_auth = True

    sess = get_or_create_guest_store(requested_token, ip_hash)
    
    data = GuestSessionResponse(
        session_token=sess["session_token"],
        voice_chat_count=0 if is_auth else sess["voice_chat_count"],
        max_free_chats=MAX_FREE_GUEST_VOICE_CHATS,
        expires_at=sess["expires_at"].isoformat(),
        is_authenticated=is_auth,
        temporary_conversation_id=sess.get("temporary_conversation_id"),
        temporary_journey_data=sess.get("temporary_journey_data")
    )
    return ResponseWrapper(data=data)


@router.get("/voice-access", response_model=ResponseWrapper[VoiceAccessResponse])
async def check_voice_access(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_guest_token: Optional[str] = Header(None, alias="X-Guest-Session-Token")
):
    """
    Checks if voice chat is allowed before microphone or LLM initialization.
    - If Authenticated: Unlimited voice chat.
    - If Guest with count < 2: Allowed.
    - If Guest with count >= 2: Requires authentication.
    """
    # 1. Check if authenticated
    if authorization and authorization.startswith("Bearer "):
        payload = decode_token(authorization.split(" ")[1])
        if payload and payload.get("sub"):
            return ResponseWrapper(
                data=VoiceAccessResponse(
                    allowed=True,
                    is_authenticated=True,
                    voice_chat_count=0,
                    max_free_chats=MAX_FREE_GUEST_VOICE_CHATS,
                    requires_auth=False,
                    message="Unlimited voice access active."
                )
            )

    # 2. Check guest session
    token_from_cookie = request.cookies.get("yatrasaathi_guest_token")
    requested_token = x_guest_token or token_from_cookie
    ip_hash = get_ip_hash(request)

    sess = get_or_create_guest_store(requested_token, ip_hash)
    count = sess["voice_chat_count"]

    if count < MAX_FREE_GUEST_VOICE_CHATS:
        return ResponseWrapper(
            data=VoiceAccessResponse(
                allowed=True,
                is_authenticated=False,
                voice_chat_count=count,
                max_free_chats=MAX_FREE_GUEST_VOICE_CHATS,
                requires_auth=False,
                message=f"Free guest voice conversation {count + 1} of {MAX_FREE_GUEST_VOICE_CHATS}."
            )
        )
    else:
        return ResponseWrapper(
            data=VoiceAccessResponse(
                allowed=False,
                is_authenticated=False,
                voice_chat_count=count,
                max_free_chats=MAX_FREE_GUEST_VOICE_CHATS,
                requires_auth=True,
                message="You've used your 2 free voice conversations. Please sign in to continue."
            )
        )


@router.post("/voice/start")
async def start_voice_session(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_guest_token: Optional[str] = Header(None, alias="X-Guest-Session-Token")
):
    """
    Registers that a voice session started.
    """
    token_from_cookie = request.cookies.get("yatrasaathi_guest_token")
    requested_token = x_guest_token or token_from_cookie
    ip_hash = get_ip_hash(request)

    sess = get_or_create_guest_store(requested_token, ip_hash)
    return ResponseWrapper(
        data={
            "session_token": sess["session_token"],
            "status": "started",
            "current_count": sess["voice_chat_count"]
        }
    )


@router.post("/voice/complete")
async def complete_voice_session(
    body: VoiceCompleteRequest,
    request: Request,
    authorization: Optional[str] = Header(None),
    x_guest_token: Optional[str] = Header(None, alias="X-Guest-Session-Token")
):
    """
    Called ONLY when a meaningful voice conversation has actually completed.
    Increments server-side voice_chat_count.
    """
    is_auth = False
    if authorization and authorization.startswith("Bearer "):
        payload = decode_token(authorization.split(" ")[1])
        if payload and payload.get("sub"):
            is_auth = True

    token_from_cookie = request.cookies.get("yatrasaathi_guest_token")
    requested_token = body.session_token or x_guest_token or token_from_cookie
    ip_hash = get_ip_hash(request)

    sess = get_or_create_guest_store(requested_token, ip_hash)

    # Only count for guests
    if not is_auth:
        sess["voice_chat_count"] += 1
        if body.conversation_id:
            sess["temporary_conversation_id"] = body.conversation_id
        if body.journey_data:
            sess["temporary_journey_data"] = body.journey_data

        sess["voice_usages"].append({
            "conversation_id": body.conversation_id,
            "turns_count": body.turns_count,
            "duration_seconds": body.duration_seconds,
            "completed_at": datetime.now(timezone.utc).isoformat()
        })

    return ResponseWrapper(
        data={
            "voice_chat_count": sess["voice_chat_count"] if not is_auth else 0,
            "max_free_chats": MAX_FREE_GUEST_VOICE_CHATS,
            "is_authenticated": is_auth,
            "remaining_free": max(0, MAX_FREE_GUEST_VOICE_CHATS - sess["voice_chat_count"]) if not is_auth else 999,
            "toast_message": (
                "1 of 2 free voice conversations used" if sess["voice_chat_count"] == 1
                else "You've used your 2 free voice conversations." if sess["voice_chat_count"] >= 2
                else None
            ) if not is_auth else None
        }
    )


@router.post("/convert")
async def convert_guest_session(
    body: ConvertSessionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Transfers temporary guest data & conversations to the newly authenticated user.
    """
    token = body.session_token
    transferred_data = {}
    if token in GUEST_STORE:
        sess = GUEST_STORE[token]
        transferred_data = {
            "conversation_id": sess.get("temporary_conversation_id"),
            "journey_data": sess.get("temporary_journey_data")
        }
        # Mark converted
        sess["converted_to_user_id"] = str(current_user.id)

    return ResponseWrapper(
        data={
            "status": "converted",
            "user_id": str(current_user.id),
            "transferred_data": transferred_data
        }
    )
