from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.context import ContextRepository
from app.services.context_service import ContextService
from app.schemas.context import WeatherSnapshotResponse, CrowdObservationResponse
from app.schemas.base import ResponseWrapper

router = APIRouter(prefix="/context", tags=["Context"])


@router.get("/weather", response_model=ResponseWrapper[WeatherSnapshotResponse])
async def get_weather(
    lat: float,
    lng: float,
    db: AsyncSession = Depends(get_db)
):
    # Validate coordinates
    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lng <= 180.0):
        raise HTTPException(
            status_code=400,
            detail="Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180."
        )

    context_repo = ContextRepository(db)
    context_svc = ContextService(context_repo)

    snapshot = await context_svc.get_latest_weather(lat, lng)
    if not snapshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No fresh weather snapshot found for this location."
        )

    return ResponseWrapper(data=WeatherSnapshotResponse.model_validate(snapshot))


@router.get("/crowds", response_model=ResponseWrapper[CrowdObservationResponse])
async def get_crowds(
    place_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    context_repo = ContextRepository(db)
    context_svc = ContextService(context_repo)

    obs = await context_svc.get_latest_crowd_observation(place_id)
    if not obs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No fresh crowd observations found for this place."
        )

    return ResponseWrapper(data=CrowdObservationResponse.model_validate(obs))
