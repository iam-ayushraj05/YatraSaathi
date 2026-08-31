"""
yatrasaathi — User and Accessibility Profile schemas.
"""
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.enums import UserRole, RouteStyle


class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None  # ID token or JWT
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None


class PhoneOtpSendRequest(BaseModel):
    phone: str = Field(..., description="Phone number with country code, e.g., +919876543210")


class PhoneOtpVerifyRequest(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)
    name: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class OnboardingRequest(BaseModel):
    travel_style: Optional[str] = None  # SOLO, FAMILY, FRIENDS, BUSINESS, ASSISTED
    accessibility_features: Optional[List[str]] = None
    walking_limit_meters: Optional[int] = None


class SaveJourneyRequest(BaseModel):
    journey_id: Optional[str] = None
    title: str
    origin: str
    destination: str
    accessibility_score: Optional[float] = 0.95
    route_details: Optional[Dict[str, Any]] = None


class SavePlaceRequest(BaseModel):
    place_id: str
    name: str
    category: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    auth_provider: Optional[str] = "EMAIL"
    avatar_url: Optional[str] = None
    is_phone_verified: Optional[bool] = False
    is_email_verified: Optional[bool] = False
    onboarding_completed: Optional[bool] = False
    travel_style: Optional[str] = None
    points: Optional[int] = 350
    saved_places: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    saved_journeys: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AccessibilityProfileBase(BaseModel):
    mobility_preferences: Optional[dict] = Field(default_factory=dict)
    vision_preferences: Optional[dict] = Field(default_factory=dict)
    hearing_preferences: Optional[dict] = Field(default_factory=dict)
    cognitive_preferences: Optional[dict] = Field(default_factory=dict)
    walking_limit_meters: Optional[int] = Field(None, ge=0)
    avoid_stairs: bool = False
    prefer_step_free: bool = False
    prefer_rest_stops: bool = False
    preferred_route_style: RouteStyle = RouteStyle.BALANCED


class AccessibilityProfileCreate(AccessibilityProfileBase):
    pass


class AccessibilityProfileUpdate(AccessibilityProfileBase):
    pass


class AccessibilityProfileResponse(AccessibilityProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
