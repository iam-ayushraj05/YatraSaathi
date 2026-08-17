from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.repositories.place import PlaceRepository
from app.repositories.barrier import BarrierRepository
from app.repositories.user import UserRepository
from app.repositories.accessibility import AccessibilityRepository
from app.repositories.route import RouteRepository
from app.repositories.context import ContextRepository
from app.services.trust_service import TrustService
from app.services.barrier_service import BarrierService
from app.services.accessibility_service import AccessibilityService
from app.services.scoring_service import ScoringService
from app.services.context_service import ContextService
from app.services.route_service import RouteService
from app.services.copilot_service import CopilotService
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse
from app.schemas.base import ResponseWrapper
from app.models.user import User
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/copilot", tags=["Copilot"])

async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Optional[AsyncSession] = Depends(get_db)
) -> Optional[User]:
    if not db:
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except Exception:
        return None

@router.post("/chat", response_model=ResponseWrapper[CopilotChatResponse])
async def chat_copilot(
    req: CopilotChatRequest,
    db: Optional[AsyncSession] = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Travel Copilot AI Chat endpoint.
    Retrieves real context from places, routes, barriers, profiles, weather,
    and constructs structured AI response.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    # Initialize repositories
    place_repo = PlaceRepository(db) if db else None
    barrier_repo = BarrierRepository(db) if db else None
    user_repo = UserRepository(db) if db else None
    acc_repo = AccessibilityRepository(db) if db else None
    route_repo = RouteRepository(db) if db else None
    context_repo = ContextRepository(db) if db else None

    # Initialize services
    trust_svc = TrustService()
    barrier_svc = BarrierService(barrier_repo, trust_svc)
    acc_svc = AccessibilityService(acc_repo, barrier_svc, trust_svc)
    scoring_svc = ScoringService()
    context_svc = ContextService(context_repo)
    route_svc = RouteService(
        route_repo=route_repo,
        barrier_repo=barrier_repo,
        scoring_service=scoring_svc,
        context_service=context_svc
    )

    copilot_svc = CopilotService(
        place_repo=place_repo,
        barrier_repo=barrier_repo,
        user_repo=user_repo,
        route_service=route_svc,
        context_service=context_svc,
        accessibility_service=acc_svc
    )

    user_id = current_user.id if current_user else None


    result = await copilot_svc.chat(
        message=req.message,
        current_location=req.current_location.model_dump() if req.current_location else None,
        destination_location=req.destination.model_dump() if req.destination else None,
        user_id=user_id,
        profile_id=req.profile_id,
        conversation_history=req.conversation_history
    )

    resp_data = CopilotChatResponse(
        response=result["response"],
        relevant_places=result.get("relevant_places"),
        relevant_accessibility=result.get("relevant_accessibility"),
        warnings=result.get("warnings"),
        route_info=result.get("route_info")
    )

    return ResponseWrapper(data=resp_data)


from app.services.voice_service import VoiceService
from app.schemas.copilot import CopilotChatRequest, CopilotChatResponse, VoiceProcessRequest, VoiceProcessResponse

@router.post("/voice-process", response_model=ResponseWrapper[VoiceProcessResponse])
async def process_voice_copilot(
    req: VoiceProcessRequest,
    db: Optional[AsyncSession] = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Executes Voice Travel Copilot Pipeline:
    Deepgram STT -> YatraSaathi Travel Copilot (Gemini + Places/Routes/Barriers/Weather) -> Murf TTS.
    """
    place_repo = PlaceRepository(db) if db else None
    barrier_repo = BarrierRepository(db) if db else None
    user_repo = UserRepository(db) if db else None
    acc_repo = AccessibilityRepository(db) if db else None
    route_repo = RouteRepository(db) if db else None
    context_repo = ContextRepository(db) if db else None

    trust_svc = TrustService()
    barrier_svc = BarrierService(barrier_repo, trust_svc)
    acc_svc = AccessibilityService(acc_repo, barrier_svc, trust_svc)
    scoring_svc = ScoringService()
    context_svc = ContextService(context_repo)
    route_svc = RouteService(
        route_repo=route_repo,
        barrier_repo=barrier_repo,
        scoring_service=scoring_svc,
        context_service=context_svc
    )

    copilot_svc = CopilotService(
        place_repo=place_repo,
        barrier_repo=barrier_repo,
        user_repo=user_repo,
        route_service=route_svc,
        context_service=context_svc,
        accessibility_service=acc_svc
    )

    voice_svc = VoiceService(copilot_svc)
    user_id = current_user.id if current_user else None

    result = await voice_svc.process_voice_pipeline(
        transcript_text=req.transcript,
        current_location=req.current_location.model_dump() if req.current_location else None,
        user_id=user_id,
        voice_gender=req.voice_gender,
        voice_id=req.voice_id,
        conversation_history=req.conversation_history
    )


    resp_data = VoiceProcessResponse(
        transcript=result["transcript"],
        response=result["response"],
        audio=result.get("audio"),
        relevant_places=result.get("relevant_places"),
        route_info=result.get("route_info"),
        warnings=result.get("warnings"),
        is_end_call=result.get("is_end_call", False)
    )


    return ResponseWrapper(data=resp_data)


@router.get("/voice-token", response_model=ResponseWrapper[dict])
async def get_voice_token(
    room_name: Optional[str] = "yatrasaathi-travel-room",
    participant_name: Optional[str] = "traveller",
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Generates LiveKit voice token for Voice Travel Copilot.
    """
    url = settings.livekit_url or "wss://yatrasaathi-voice.livekit.cloud"
    api_key = settings.livekit_api_key or "demo_livekit_key"
    api_secret = settings.livekit_api_secret or "demo_livekit_secret"

    token = "demo_jwt_token_livekit"
    try:
        if settings.livekit_api_key and settings.livekit_api_secret:
            from livekit import api as livekit_api
            lk_token = livekit_api.AccessToken(api_key, api_secret) \
                .with_identity(participant_name or str(current_user.id if current_user else "guest")) \
                .with_name(participant_name or "Traveller") \
                .with_grants(livekit_api.VideoGrants(
                    room_join=True,
                    room=room_name
                ))
            token = lk_token.to_jwt()
    except Exception as e:
        pass

    return ResponseWrapper(data={
        "server_url": url,
        "room_name": room_name,
        "token": token,
        "provider": settings.voice_provider
    })


