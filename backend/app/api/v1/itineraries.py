from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.itinerary import ItineraryRepository
from app.repositories.place import PlaceRepository
from app.repositories.accessibility import AccessibilityRepository
from app.repositories.barrier import BarrierRepository
from app.services.itinerary_service import ItineraryService
from app.services.accessibility_service import AccessibilityService
from app.services.barrier_service import BarrierService
from app.services.trust_service import TrustService
from app.models.user import User, AccessibilityProfile
from app.api.v1.auth import get_current_user
from app.schemas.itinerary import (
    ItineraryCreate,
    ItineraryUpdate,
    ItineraryStopCreate,
    ItineraryResponse,
    ItineraryStopResponse
)
from app.schemas.base import ResponseWrapper

router = APIRouter(prefix="/itineraries", tags=["Itineraries"])


def get_itinerary_service(db: AsyncSession) -> ItineraryService:
    itinerary_repo = ItineraryRepository(db)
    place_repo = PlaceRepository(db)
    access_repo = AccessibilityRepository(db)
    barrier_repo = BarrierRepository(db)
    
    trust_svc = TrustService()
    barrier_svc = BarrierService(barrier_repo, trust_svc)
    access_svc = AccessibilityService(access_repo, barrier_svc, trust_svc)

    return ItineraryService(
        itinerary_repo=itinerary_repo,
        place_repo=place_repo,
        accessibility_service=access_svc
    )


@router.post("", response_model=ResponseWrapper[ItineraryResponse])
async def create_itinerary(
    itinerary_in: ItineraryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_svc = get_itinerary_service(db)
    
    # 1. Create itinerary
    itinerary = await itinerary_svc.create_itinerary(
        user_id=current_user.id,
        title=itinerary_in.title
    )
    await db.flush()

    # Get user profile for accessibility snapshot
    from app.repositories.user import UserRepository
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_user_id(current_user.id)

    # 2. Add stops
    for idx, stop in enumerate(itinerary_in.stops):
        sequence = stop.sequence if stop.sequence else idx + 1
        await itinerary_svc.add_stop(
            itinerary_id=itinerary.id,
            place_id=stop.place_id,
            sequence=sequence,
            planned_start=stop.planned_start,
            planned_end=stop.planned_end,
            notes=stop.notes,
            profile=profile
        )

    await db.commit()
    
    # Reload itinerary with preloaded relations
    refreshed = await itinerary_svc.get_itinerary(itinerary.id)
    return ResponseWrapper(data=ItineraryResponse.model_validate(refreshed))


@router.get("/{itinerary_id}", response_model=ResponseWrapper[ItineraryResponse])
async def get_itinerary(
    itinerary_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_svc = get_itinerary_service(db)
    user_role = getattr(current_user.role, "value", current_user.role)
    if itinerary.user_id != current_user.id and user_role not in ("AUDITOR", "AUTHORITY", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this itinerary"
        )
    return ResponseWrapper(data=ItineraryResponse.model_validate(itinerary))


@router.put("/{itinerary_id}", response_model=ResponseWrapper[ItineraryResponse])
async def update_itinerary(
    itinerary_id: UUID,
    itinerary_in: ItineraryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_svc = get_itinerary_service(db)
    user_role = getattr(current_user.role, "value", current_user.role)
    if itinerary.user_id != current_user.id and user_role not in ("ADMIN",):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to modify this itinerary"
        )

    # Update basic fields
    itinerary_repo = ItineraryRepository(db)
    updated_fields = itinerary_in.model_dump(exclude={"stops"}, exclude_unset=True)
    if updated_fields:
        for k, v in updated_fields.items():
            setattr(itinerary, k, v)
        await db.flush()

    # Reorder/replace stops if provided
    if itinerary_in.stops is not None:
        await itinerary_svc.reorder_stops(
            itinerary_id=itinerary_id,
            place_ids=[s.place_id for s in itinerary_in.stops]
        )

    await db.commit()
    refreshed = await itinerary_svc.get_itinerary(itinerary_id)
    return ResponseWrapper(data=ItineraryResponse.model_validate(refreshed))


@router.post("/{itinerary_id}/stops", response_model=ResponseWrapper[ItineraryStopResponse])
async def add_itinerary_stop(
    itinerary_id: UUID,
    stop_in: ItineraryStopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_svc = get_itinerary_service(db)
    user_role = getattr(current_user.role, "value", current_user.role)
    if itinerary.user_id != current_user.id and user_role not in ("ADMIN",):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to modify this itinerary"
        )

    # Get user profile for accessibility snapshot
    from app.repositories.user import UserRepository
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_user_id(current_user.id)

    # Infer sequence if not set
    sequence = stop_in.sequence
    if not sequence:
        sequence = len(itinerary.stops) + 1

    stop = await itinerary_svc.add_stop(
        itinerary_id=itinerary_id,
        place_id=stop_in.place_id,
        sequence=sequence,
        planned_start=stop_in.planned_start,
        planned_end=stop_in.planned_end,
        notes=stop_in.notes,
        profile=profile
    )

    await db.commit()
    
    # Reload stop to load relations
    stop_repo = ItineraryRepository(db)
    stmt = stop_repo.db.select(stop_repo.model_stop).where(stop_repo.model_stop.id == stop.id)
    # Since stops have place relations, load them
    from sqlalchemy.orm import selectinload
    stmt = stmt.options(selectinload(stop_repo.model_stop.place))
    res = await stop_repo.db.execute(stmt)
    refreshed_stop = res.scalar_one()

    return ResponseWrapper(data=ItineraryStopResponse.model_validate(refreshed_stop))


@router.get("/{itinerary_id}/suitability", response_model=ResponseWrapper[dict])
async def check_itinerary_suitability(
    itinerary_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    itinerary_svc = get_itinerary_service(db)
    
    # Retrieve user profile
    from app.repositories.user import UserRepository
    user_repo = UserRepository(db)
    profile = await user_repo.get_profile_by_user_id(current_user.id)
    if not profile:
        profile = AccessibilityProfile()

    suitability = await itinerary_svc.check_itinerary_suitability(itinerary_id, profile)
    return ResponseWrapper(data=suitability)
