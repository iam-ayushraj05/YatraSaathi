from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.user import UserRepository
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.schemas.user import (
    AccessibilityProfileCreate,
    AccessibilityProfileUpdate,
    AccessibilityProfileResponse
)
from app.schemas.base import ResponseWrapper

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.post("", response_model=ResponseWrapper[AccessibilityProfileResponse])
async def create_profile(
    profile_in: AccessibilityProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_repo = UserRepository(db)
    
    # Check if user already has a profile
    existing = await user_repo.get_profile_by_user_id(current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an accessibility profile. Use PUT to update."
        )

    profile = await user_repo.create_profile(
        user_id=current_user.id,
        profile_data=profile_in.model_dump()
    )
    await db.commit()
    await db.refresh(profile)
    return ResponseWrapper(data=AccessibilityProfileResponse.model_validate(profile))


@router.get("/{profile_id}", response_model=ResponseWrapper[AccessibilityProfileResponse])
async def get_profile(
    profile_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Check permissions (only own profile or auditor/admin)
    user_role = getattr(current_user.role, "value", current_user.role)
    if profile.user_id != current_user.id and user_role not in ("AUDITOR", "AUTHORITY", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this profile"
        )

    return ResponseWrapper(data=AccessibilityProfileResponse.model_validate(profile))


@router.put("/{profile_id}", response_model=ResponseWrapper[AccessibilityProfileResponse])
async def update_profile(
    profile_id: UUID,
    profile_in: AccessibilityProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    user_role = getattr(current_user.role, "value", current_user.role)
    if profile.user_id != current_user.id and user_role not in ("ADMIN",):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to modify this profile"
        )

    updated = await user_repo.update_profile(profile_id, profile_in.model_dump(exclude_unset=True))
    await db.commit()
    await db.refresh(updated)
    return ResponseWrapper(data=AccessibilityProfileResponse.model_validate(updated))
