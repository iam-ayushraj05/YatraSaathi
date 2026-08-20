"""
yatrasaathi — User and Accessibility Profile schemas.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.enums import UserRole, RouteStyle


class UserBase(BaseModel):
    email: EmailStr
    display_name: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
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
