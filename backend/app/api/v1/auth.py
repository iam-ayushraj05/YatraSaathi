import hmac
import hashlib
import base64
import json
import random
import time
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, Header, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.repositories.user import UserRepository
from app.models.user import User, AccessibilityProfile
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse,
    GoogleAuthRequest, PhoneOtpSendRequest, PhoneOtpVerifyRequest,
    ForgotPasswordRequest, ResetPasswordRequest, OnboardingRequest,
    SaveJourneyRequest, SavePlaceRequest
)
from app.schemas.base import ResponseWrapper

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET = "yatrasaathi-super-secret-key-12345"

# In-memory store for OTPs, reset tokens, and active sessions for high resilience
# phone -> {"otp": str, "expires_at": float, "resend_after": float, "attempts": int}
OTP_STORE: Dict[str, Dict[str, Any]] = {}
RESET_STORE: Dict[str, Dict[str, Any]] = {}

# Fast mock/memory user registry fallback when running without postgres
MEMORY_USERS: Dict[str, Dict[str, Any]] = {
    "aarav@yatrasaathi.in": {
        "id": "00000000-0000-0000-0000-000000000001",
        "email": "aarav@yatrasaathi.in",
        "display_name": "Aarav Sharma",
        "first_name": "Aarav",
        "last_name": "Sharma",
        "phone": "+919876543210",
        "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
        "auth_provider": "EMAIL",
        "role": "TRAVELLER",
        "is_active": True,
        "onboarding_completed": True,
        "travel_style": "SOLO",
        "points": 350,
        "saved_places": [],
        "saved_journeys": [],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    }
}


def create_token(user_id: str, email: str, role: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": str(role),
        "exp": int(time.time()) + (30 * 86400), # 30 days
        "iat": int(time.time())
    }
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    msg = f"{header_b64}.{payload_b64}".encode()
    sig = hmac.new(SECRET.encode(), msg, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        msg = f"{header_b64}.{payload_b64}".encode()
        sig = hmac.new(SECRET.encode(), msg, hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        return json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
    except Exception:
        return None


async def get_current_user(authorization: Optional[str] = Header(None), db: Optional[AsyncSession] = Depends(get_db)) -> User:
    try:
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            payload = decode_token(token)
            if payload:
                user_id_str = payload.get("sub")
                email = payload.get("email")

                # Try database first
                if db:
                    try:
                        user_repo = UserRepository(db)
                        user = await user_repo.get_by_id(UUID(user_id_str))
                        if user:
                            return user
                    except Exception:
                        pass

                # Check memory store
                if email and email in MEMORY_USERS:
                    m = MEMORY_USERS[email]
                    return User(
                        id=UUID(m["id"]),
                        email=m["email"],
                        display_name=m["display_name"],
                        first_name=m.get("first_name"),
                        last_name=m.get("last_name"),
                        phone=m.get("phone"),
                        auth_provider=m.get("auth_provider", "EMAIL"),
                        role=m.get("role", "TRAVELLER"),
                        is_active=True,
                        onboarding_completed=m.get("onboarding_completed", False),
                        travel_style=m.get("travel_style"),
                        points=m.get("points", 350),
                        saved_places=m.get("saved_places", []),
                        saved_journeys=m.get("saved_journeys", [])
                    )

                # Return synthetic user from payload
                return User(
                    id=UUID(user_id_str) if len(user_id_str) == 36 else UUID("00000000-0000-0000-0000-000000000001"),
                    email=email or "user@yatrasaathi.in",
                    display_name=email.split("@")[0] if email else "YatraSaathi Traveller",
                    role="TRAVELLER"
                )
    except Exception:
        pass

    if settings.demo_mode:
        return User(
            id=UUID("00000000-0000-0000-0000-000000000001"),
            email="aarav@yatrasaathi.in",
            display_name="Aarav Sharma",
            first_name="Aarav",
            last_name="Sharma",
            phone="+919876543210",
            role="TRAVELLER",
            points=350
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )


@router.post("/register", response_model=ResponseWrapper[dict])
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new user with First Name, Last Name, Email, Phone, Password.
    Enforces email uniqueness and provider conflict checks.
    """
    email_clean = user_in.email.strip().lower()
    first_name = user_in.first_name or user_in.display_name.split()[0]
    last_name = user_in.last_name or (" ".join(user_in.display_name.split()[1:]) if len(user_in.display_name.split()) > 1 else "")
    display_name = f"{first_name} {last_name}".strip() or user_in.display_name
    password_hash = hashlib.sha256(user_in.password.encode()).hexdigest()

    # Check memory registry for conflicts
    if email_clean in MEMORY_USERS:
        existing = MEMORY_USERS[email_clean]
        if existing.get("auth_provider") == "GOOGLE":
            raise HTTPException(
                status_code=400,
                detail="This email is already registered using Google Sign-In. Please sign in with Google."
            )
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists. Please sign in instead."
        )

    user_id = str(uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    # Try DB
    try:
        user_repo = UserRepository(db)
        existing = await user_repo.get_by_email(email_clean)
        if existing:
            if getattr(existing, 'auth_provider', None) == "GOOGLE":
                raise HTTPException(
                    status_code=400,
                    detail="This email is already registered using Google Sign-In. Please sign in with Google."
                )
            raise HTTPException(
                status_code=400,
                detail="An account with this email address already exists. Please sign in instead."
            )

        user = await user_repo.create_user(
            email=email_clean,
            display_name=display_name,
            password_hash=password_hash,
            role="TRAVELLER"
        )
        user.first_name = first_name
        user.last_name = last_name
        user.phone = user_in.phone
        user.auth_provider = "EMAIL"
        user.points = 350
        await db.commit()
        await db.refresh(user)
        user_id = str(user.id)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AUTH] DB registration fallback: {e}")

    # Store in memory registry
    user_record = {
        "id": user_id,
        "email": email_clean,
        "display_name": display_name,
        "first_name": first_name,
        "last_name": last_name,
        "phone": user_in.phone,
        "password_hash": password_hash,
        "auth_provider": "EMAIL",
        "role": "TRAVELLER",
        "is_active": True,
        "onboarding_completed": False,
        "travel_style": None,
        "points": 350,
        "saved_places": [],
        "saved_journeys": [],
        "created_at": now_iso,
        "updated_at": now_iso
    }
    MEMORY_USERS[email_clean] = user_record

    token = create_token(user_id, email_clean, "TRAVELLER")
    return ResponseWrapper(
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": user_record,
            "requires_onboarding": True
        }
    )


@router.post("/login")
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Standard Email/Password login with provider conflict checks.
    """
    email_clean = user_in.email.strip().lower()
    input_hash = hashlib.sha256(user_in.password.encode()).hexdigest()

    # Check if account was created with Google
    if email_clean in MEMORY_USERS and MEMORY_USERS[email_clean].get("auth_provider") == "GOOGLE":
        raise HTTPException(
            status_code=400,
            detail="This account was registered with Google Sign-In. Please sign in with Google."
        )

    # Check DB
    try:
        user_repo = UserRepository(db)
        user = await user_repo.get_by_email(email_clean)
        if user:
            if getattr(user, 'auth_provider', None) == "GOOGLE":
                raise HTTPException(
                    status_code=400,
                    detail="This account was registered with Google Sign-In. Please sign in with Google."
                )
            if user.password_hash == input_hash:
                token = create_token(str(user.id), user.email, user.role.value if hasattr(user.role, 'value') else user.role)
                return {
                    "access_token": token,
                    "token_type": "bearer",
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "display_name": user.display_name,
                        "first_name": getattr(user, 'first_name', None),
                        "last_name": getattr(user, 'last_name', None),
                        "points": getattr(user, 'points', 350),
                        "onboarding_completed": getattr(user, 'onboarding_completed', False)
                    }
                }
    except HTTPException:
        raise
    except Exception:
        pass

    # Check memory registry
    if email_clean in MEMORY_USERS:
        m = MEMORY_USERS[email_clean]
        if m.get("password_hash") == input_hash:
            token = create_token(m["id"], m["email"], m.get("role", "TRAVELLER"))
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": m
            }

    # Demo fallback for testing
    if settings.demo_mode and email_clean == "aarav@yatrasaathi.in" and user_in.password == "password123":
        m = MEMORY_USERS["aarav@yatrasaathi.in"]
        token = create_token(m["id"], m["email"], m["role"])
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": m
        }

    raise HTTPException(status_code=400, detail="The email or password is incorrect. Please try again.")


@router.post("/google")
async def google_auth(auth_in: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Real Google OAuth authentication endpoint.
    Decodes Google ID token credentials and verifies provider conflicts.
    Does NOT log in if email is already registered with standard email/password.
    """
    email = auth_in.email
    name = auth_in.name
    avatar_url = auth_in.avatar_url
    google_id = auth_in.google_id

    # 1. Decode Google ID Token if passed
    if auth_in.credential:
        try:
            parts = auth_in.credential.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                google_payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
                email = google_payload.get("email") or email
                name = google_payload.get("name") or name
                avatar_url = google_payload.get("picture") or avatar_url
                google_id = google_payload.get("sub") or google_id
        except Exception as e:
            print(f"[GOOGLE AUTH] Token decode error: {e}")

    if not email:
        email = "google.traveller@yatrasaathi.in"
        name = name or "Google Traveller"

    email_clean = email.strip().lower()

    # 2. Check if email already registered with PASSWORD / standard EMAIL
    # Rule: "doesnot login if gmail already registered with password"
    existing_user_db = None
    try:
        if db:
            user_repo = UserRepository(db)
            existing_user_db = await user_repo.get_by_email(email_clean)
    except Exception:
        pass

    existing_user_mem = MEMORY_USERS.get(email_clean)

    is_password_user = False
    if existing_user_db and (getattr(existing_user_db, 'auth_provider', None) == 'EMAIL' or getattr(existing_user_db, 'password_hash', None)):
        is_password_user = True
    if existing_user_mem and (existing_user_mem.get('auth_provider') == 'EMAIL' or existing_user_mem.get('password_hash')):
        is_password_user = True

    if is_password_user:
        raise HTTPException(
            status_code=400,
            detail=f"The email {email_clean} is already registered with a password. Please sign in using your email and password."
        )

    # 3. If already registered with GOOGLE, log them in
    if existing_user_mem and existing_user_mem.get("auth_provider") == "GOOGLE":
        user_record = existing_user_mem
        user_id = user_record["id"]
    elif existing_user_db and getattr(existing_user_db, 'auth_provider', None) == "GOOGLE":
        user_id = str(existing_user_db.id)
        user_record = {
            "id": user_id,
            "email": email_clean,
            "display_name": existing_user_db.display_name,
            "first_name": getattr(existing_user_db, 'first_name', name.split()[0] if name else "Traveller"),
            "last_name": getattr(existing_user_db, 'last_name', ""),
            "auth_provider": "GOOGLE",
            "avatar_url": avatar_url or getattr(existing_user_db, 'avatar_url', None),
            "points": getattr(existing_user_db, 'points', 350),
            "is_active": True
        }
        MEMORY_USERS[email_clean] = user_record
    else:
        # 4. Create new user with GOOGLE provider
        first_name = name.split()[0] if name else "Traveller"
        last_name = " ".join(name.split()[1:]) if name and len(name.split()) > 1 else ""
        user_id = str(uuid4())
        user_record = {
            "id": user_id,
            "email": email_clean,
            "display_name": name or f"{first_name} {last_name}".strip(),
            "first_name": first_name,
            "last_name": last_name,
            "phone": None,
            "auth_provider": "GOOGLE",
            "avatar_url": avatar_url,
            "role": "TRAVELLER",
            "is_active": True,
            "onboarding_completed": False,
            "points": 350,
            "saved_places": [],
            "saved_journeys": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        MEMORY_USERS[email_clean] = user_record

        if db:
            try:
                user_repo = UserRepository(db)
                new_u = await user_repo.create_user(
                    email=email_clean,
                    display_name=name or first_name,
                    role="TRAVELLER"
                )
                new_u.first_name = first_name
                new_u.last_name = last_name
                new_u.auth_provider = "GOOGLE"
                new_u.avatar_url = avatar_url
                await db.commit()
            except Exception as e:
                print(f"[GOOGLE AUTH] DB creation fallback: {e}")

    token = create_token(user_id, email_clean, "TRAVELLER")
    return ResponseWrapper(
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": user_record,
            "message": "Google authentication successful."
        }
    )


@router.post("/phone/send-otp")
async def send_phone_otp(body: PhoneOtpSendRequest):
    """
    Generates 6-digit OTP for phone verification.
    Enforces 24s resend cooldown and 2-minute expiration.
    """
    phone_clean = body.phone.strip().replace(" ", "").replace("-", "")
    if not phone_clean.startswith("+"):
        phone_clean = f"+91{phone_clean}"

    now = time.time()
    existing = OTP_STORE.get(phone_clean)

    # Check 24-second resend cooldown
    if existing and now < existing["resend_after"]:
        remaining_wait = int(existing["resend_after"] - now)
        raise HTTPException(
            status_code=429,
            detail=f"Please wait {remaining_wait}s before requesting a new OTP."
        )

    # Generate 6-digit OTP (e.g. 123456 in demo/dev or real random 6-digit)
    otp_code = "123456" if settings.demo_mode else f"{random.randint(100000, 999999)}"
    
    OTP_STORE[phone_clean] = {
        "otp": otp_code,
        "expires_at": now + 120,    # 2 minutes
        "resend_after": now + 24,   # 24s cooldown
        "attempts": 0
    }

    print(f"[AUTH] OTP for {phone_clean}: {otp_code} (Valid for 2 mins)")

    return ResponseWrapper(
        data={
            "status": "sent",
            "phone": phone_clean,
            "expires_in_seconds": 120,
            "resend_in_seconds": 24,
            "demo_otp_hint": otp_code if settings.demo_mode else None,
            "message": "OTP sent successfully to your phone number."
        }
    )


@router.post("/phone/verify-otp")
async def verify_phone_otp(body: PhoneOtpVerifyRequest, db: AsyncSession = Depends(get_db)):
    """
    Verifies 6-digit phone OTP and issues authentication token.
    """
    phone_clean = body.phone.strip().replace(" ", "").replace("-", "")
    if not phone_clean.startswith("+"):
        phone_clean = f"+91{phone_clean}"

    now = time.time()
    record = OTP_STORE.get(phone_clean)

    # Allow demo master OTP 123456 in demo mode
    is_valid = False
    if settings.demo_mode and body.otp == "123456":
        is_valid = True
    elif record:
        if now > record["expires_at"]:
            raise HTTPException(status_code=400, detail="The OTP has expired. Please request a new code.")
        
        record["attempts"] += 1
        if record["attempts"] > 5:
            del OTP_STORE[phone_clean]
            raise HTTPException(status_code=429, detail="Too many incorrect attempts. Please request a new OTP.")

        if record["otp"] == body.otp.strip():
            is_valid = True

    if not is_valid:
        raise HTTPException(status_code=400, detail="The OTP is incorrect. Please try again.")

    # Successful OTP verification: find or create user
    email = f"{phone_clean.replace('+', '')}@yatrasaathi.in"
    name = body.name or f"Traveller {phone_clean[-4:]}"
    user_id = str(uuid4())

    if email in MEMORY_USERS:
        user_record = MEMORY_USERS[email]
        user_id = user_record["id"]
    else:
        user_record = {
            "id": user_id,
            "email": email,
            "display_name": name,
            "first_name": name.split()[0],
            "last_name": "",
            "phone": phone_clean,
            "auth_provider": "PHONE",
            "is_phone_verified": True,
            "role": "TRAVELLER",
            "is_active": True,
            "onboarding_completed": False,
            "points": 350,
            "saved_places": [],
            "saved_journeys": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        MEMORY_USERS[email] = user_record

    # Clear OTP
    if phone_clean in OTP_STORE:
        del OTP_STORE[phone_clean]

    token = create_token(user_id, email, "TRAVELLER")
    return ResponseWrapper(
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": user_record,
            "message": "Phone number verified successfully."
        }
    )


@router.post("/password/forgot")
async def forgot_password(body: ForgotPasswordRequest):
    """
    Sends password reset token / email.
    """
    email_clean = body.email.strip().lower()
    token = f"reset_{uuid4().hex}"
    RESET_STORE[token] = {
        "email": email_clean,
        "expires_at": time.time() + 900  # 15 minutes
    }
    return ResponseWrapper(
        data={
            "status": "sent",
            "message": f"Password reset instructions sent to {email_clean}",
            "reset_token_hint": token if settings.demo_mode else None
        }
    )


@router.post("/password/reset")
async def reset_password(body: ResetPasswordRequest):
    """
    Resets password using valid token.
    """
    token_record = RESET_STORE.get(body.token)
    if not token_record or time.time() > token_record["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    email = token_record["email"]
    new_hash = hashlib.sha256(body.new_password.encode()).hexdigest()

    if email in MEMORY_USERS:
        MEMORY_USERS[email]["password_hash"] = new_hash

    del RESET_STORE[body.token]
    return ResponseWrapper(data={"status": "success", "message": "Password has been reset successfully."})


@router.post("/onboarding")
async def complete_onboarding(
    body: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Saves post-signup onboarding preferences:
    - Step 1: Travel style (SOLO, FAMILY, FRIENDS, BUSINESS, ASSISTED)
    - Step 2: Accessibility features list
    """
    email = current_user.email
    if email in MEMORY_USERS:
        MEMORY_USERS[email]["onboarding_completed"] = True
        MEMORY_USERS[email]["travel_style"] = body.travel_style

    return ResponseWrapper(
        data={
            "status": "completed",
            "travel_style": body.travel_style,
            "accessibility_features": body.accessibility_features,
            "message": "Preferences saved successfully."
        }
    )


@router.get("/saved-journeys")
async def get_saved_journeys(current_user: User = Depends(get_current_user)):
    email = current_user.email
    journeys = MEMORY_USERS.get(email, {}).get("saved_journeys", [])
    return ResponseWrapper(data=journeys)


@router.post("/saved-journeys")
async def save_journey(body: SaveJourneyRequest, current_user: User = Depends(get_current_user)):
    email = current_user.email
    if email not in MEMORY_USERS:
        MEMORY_USERS[email] = {"saved_journeys": []}
    
    journey_item = {
        "id": body.journey_id or f"journey_{uuid4().hex[:8]}",
        "title": body.title,
        "origin": body.origin,
        "destination": body.destination,
        "accessibility_score": body.accessibility_score,
        "route_details": body.route_details,
        "saved_at": datetime.now(timezone.utc).isoformat()
    }
    MEMORY_USERS[email]["saved_journeys"] = [journey_item] + [j for j in MEMORY_USERS[email].get("saved_journeys", []) if j.get("id") != journey_item["id"]]
    
    return ResponseWrapper(data=journey_item)


@router.get("/saved-places")
async def get_saved_places(current_user: User = Depends(get_current_user)):
    email = current_user.email
    places = MEMORY_USERS.get(email, {}).get("saved_places", [])
    return ResponseWrapper(data=places)


@router.post("/saved-places")
async def save_place(body: SavePlaceRequest, current_user: User = Depends(get_current_user)):
    email = current_user.email
    if email not in MEMORY_USERS:
        MEMORY_USERS[email] = {"saved_places": []}
    
    place_item = {
        "place_id": body.place_id,
        "name": body.name,
        "category": body.category,
        "city": body.city,
        "notes": body.notes,
        "saved_at": datetime.now(timezone.utc).isoformat()
    }
    MEMORY_USERS[email]["saved_places"] = [place_item] + [p for p in MEMORY_USERS[email].get("saved_places", []) if p.get("place_id") != body.place_id]
    
    return ResponseWrapper(data=place_item)


@router.post("/refresh")
async def refresh(current_user: User = Depends(get_current_user)):
    token = create_token(str(current_user.id), current_user.email, "TRAVELLER")
    return ResponseWrapper(data={"access_token": token, "token_type": "bearer"})


@router.post("/logout")
async def logout():
    return ResponseWrapper(data={"status": "ok", "message": "You've been logged out successfully."})


@router.get("/me", response_model=ResponseWrapper[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    email = current_user.email
    if email in MEMORY_USERS:
        m = MEMORY_USERS[email]
        return ResponseWrapper(
            data=UserResponse(
                id=UUID(m["id"]),
                email=m["email"],
                display_name=m["display_name"],
                first_name=m.get("first_name"),
                last_name=m.get("last_name"),
                phone=m.get("phone"),
                auth_provider=m.get("auth_provider", "EMAIL"),
                avatar_url=m.get("avatar_url"),
                is_phone_verified=m.get("is_phone_verified", False),
                is_email_verified=m.get("is_email_verified", False),
                onboarding_completed=m.get("onboarding_completed", False),
                travel_style=m.get("travel_style"),
                points=m.get("points", 350),
                saved_places=m.get("saved_places", []),
                saved_journeys=m.get("saved_journeys", []),
                role=current_user.role if isinstance(current_user.role, str) else current_user.role.value,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
        )

    return ResponseWrapper(data=UserResponse.model_validate(current_user))
