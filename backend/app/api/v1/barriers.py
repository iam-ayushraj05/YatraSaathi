from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.barrier import BarrierRepository
from app.services.barrier_service import BarrierService
from app.services.trust_service import TrustService
from app.schemas.barrier import BarrierResponse
from app.schemas.base import ResponseWrapper, ListResponseWrapper, MetaInfo

router = APIRouter(prefix="/barriers", tags=["Barriers"])


@router.get("/nearby", response_model=ListResponseWrapper[dict])
async def list_nearby_barriers(
    lat: float,
    lng: float,
    radius: float = 1000,
    status: Optional[str] = "ACTIVE",
    severity: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    # Validate coordinates
    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lng <= 180.0):
        raise HTTPException(
            status_code=400,
            detail="Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180."
        )

    barrier_repo = BarrierRepository(db)
    
    # We query nearby barriers. We always exclude expired temporary barriers.
    nearby = await barrier_repo.nearby_barriers(
        lat=lat,
        lng=lng,
        radius_meters=radius,
        status=status,
        severity=severity,
        exclude_expired=True
    )

    data = []
    for b, dist in nearby:
        barrier_resp = BarrierResponse.model_validate(b)
        res_dict = barrier_resp.model_dump()
        res_dict["distance_meters"] = dist
        data.append(res_dict)

    meta = MetaInfo(page=1, page_size=len(data), total=len(data))
    return ListResponseWrapper(data=data, meta=meta)


@router.get("/{barrier_id}", response_model=ResponseWrapper[dict])
async def get_barrier_details(
    barrier_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    barrier_repo = BarrierRepository(db)
    trust_svc = TrustService()
    barrier_svc = BarrierService(barrier_repo, trust_svc)

    res = await barrier_svc.get_barrier_with_trust(barrier_id)
    
    barrier_resp = BarrierResponse.model_validate(res["barrier"])
    data = barrier_resp.model_dump()
    data["trust_info"] = res["trust"]

    return ResponseWrapper(data=data)
