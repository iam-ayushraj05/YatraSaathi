from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.user import User, AccessibilityProfile
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    """Repository handling database operations for User and AccessibilityProfile."""

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, email: str, display_name: str, password_hash: Optional[str] = None, role: str = "TRAVELLER") -> User:
        user = User(
            email=email,
            display_name=display_name,
            password_hash=password_hash,
            role=role,
            is_active=True
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def get_profile_by_id(self, profile_id: UUID) -> Optional[AccessibilityProfile]:
        stmt = select(AccessibilityProfile).where(AccessibilityProfile.id == profile_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_profile_by_user_id(self, user_id: UUID) -> Optional[AccessibilityProfile]:
        stmt = select(AccessibilityProfile).where(AccessibilityProfile.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_profile(self, user_id: UUID, profile_data: dict) -> AccessibilityProfile:
        profile = AccessibilityProfile(
            user_id=user_id,
            mobility_preferences=profile_data.get("mobility_preferences", {}),
            vision_preferences=profile_data.get("vision_preferences", {}),
            hearing_preferences=profile_data.get("hearing_preferences", {}),
            cognitive_preferences=profile_data.get("cognitive_preferences", {}),
            walking_limit_meters=profile_data.get("walking_limit_meters"),
            avoid_stairs=profile_data.get("avoid_stairs", False),
            prefer_step_free=profile_data.get("prefer_step_free", False),
            prefer_rest_stops=profile_data.get("prefer_rest_stops", False),
            preferred_route_style=profile_data.get("preferred_route_style", "BALANCED")
        )
        self.db.add(profile)
        await self.db.flush()
        return profile

    async def update_profile(self, profile_id: UUID, profile_data: dict) -> Optional[AccessibilityProfile]:
        profile = await self.get_profile_by_id(profile_id)
        if not profile:
            return None
        
        for key, val in profile_data.items():
            if hasattr(profile, key) and val is not None:
                setattr(profile, key, val)
                
        await self.db.flush()
        return profile
