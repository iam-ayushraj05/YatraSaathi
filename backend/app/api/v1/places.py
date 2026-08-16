from typing import Optional, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.place import PlaceRepository
from app.repositories.accessibility import AccessibilityRepository
from app.repositories.barrier import BarrierRepository
from app.services.accessibility_service import AccessibilityService
from app.services.barrier_service import BarrierService
from app.services.trust_service import TrustService
from app.models.user import AccessibilityProfile
from app.schemas.place import (
    PlaceResponse,
    PlaceAccessibilitySummary,
    PlaceDetailsResponse,
    AccessibilityRecordResponse,
    FacilityResponse,
    AssistancePointResponse,
    parse_postgis_location
)
from app.schemas.barrier import BarrierResponse
from app.schemas.base import ResponseWrapper, ListResponseWrapper, MetaInfo

router = APIRouter(prefix="/places", tags=["Places"])


@router.get("", response_model=ListResponseWrapper[dict])
async def list_places(
    q: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 5000,
    category: Optional[str] = None,
    step_free: Optional[bool] = None,
    accessible_toilet: Optional[bool] = None,
    low_walking: Optional[bool] = None,
    verified_only: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    place_repo = PlaceRepository(db)
    access_repo = AccessibilityRepository(db)
    barrier_repo = BarrierRepository(db)
    trust_svc = TrustService()
    barrier_svc = BarrierService(barrier_repo, trust_svc)
    access_svc = AccessibilityService(access_repo, barrier_svc, trust_svc)

    dummy_profile = AccessibilityProfile()

    # Determine search mode: nearby or text search
    if lat is not None and lng is not None:
        # Validate coordinates
        if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lng <= 180.0):
            raise HTTPException(
                status_code=400,
                detail="Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180."
            )
        nearby_res, total = await place_repo.nearby_search(
            lat=lat,
            lng=lng,
            radius_meters=radius,
            q=q,
            category=category,
            page=page,
            page_size=page_size
        )
        places = [item[0] for item in nearby_res]
    else:
        places, total = await place_repo.list_places(
            q=q,
            category=category,
            page=page,
            page_size=page_size
        )

    # Process accessibility summaries
    data = []
    for place in places:
        eval_res = await access_svc.evaluate_place(place, dummy_profile)
        
        # Get barriers near place
        place_coord = parse_postgis_location(place.location)
        barriers_count = 0
        if place_coord:
            nearby_barriers = await barrier_svc.get_nearby_barriers(
                lat=place_coord.lat,
                lng=place_coord.lng,
                radius_meters=50,
                exclude_expired=True
            )
            barriers_count = len(nearby_barriers)

        verified = eval_res["trust_info"]["level"] in ("HIGH", "MEDIUM") or eval_res["trust_info"]["score"] >= 0.7

        # Apply search filters if specified
        if verified_only and not verified:
            continue
        if step_free and eval_res["level"] not in ("HIGH", "MEDIUM"):
            continue

        place_resp = PlaceResponse.model_validate(place)
        
        data.append({
            "id": str(place.id),
            "name": place.name,
            "category": place.category.value if hasattr(place.category, "value") else place.category,
            "location": place_resp.location.model_dump(),
            "accessibility_summary": {
                "level": eval_res["level"],
                "verified": verified,
                "active_barriers_count": barriers_count
            }
        })

    meta = MetaInfo(page=page, page_size=page_size, total=len(data))
    return ListResponseWrapper(data=data, meta=meta)


@router.get("/{place_id}", response_model=ResponseWrapper[PlaceDetailsResponse])
async def get_place_details(
    place_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    place_repo = PlaceRepository(db)
    access_repo = AccessibilityRepository(db)
    barrier_repo = BarrierRepository(db)
    trust_svc = TrustService()
    barrier_svc = BarrierService(barrier_repo, trust_svc)
    access_svc = AccessibilityService(access_repo, barrier_svc, trust_svc)

    place = await place_repo.get_by_id(place_id)
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )

    # Evaluate accessibility
    dummy_profile = AccessibilityProfile()
    eval_res = await access_svc.evaluate_place(place, dummy_profile)

    # Get active barriers
    place_coord = parse_postgis_location(place.location)
    active_barriers = []
    if place_coord:
        nearby = await barrier_svc.get_nearby_barriers(
            lat=place_coord.lat,
            lng=place_coord.lng,
            radius_meters=100,  # larger radius for details view
            exclude_expired=True
        )
        active_barriers = [BarrierResponse.model_validate(b) for b, _ in nearby]

    verified = eval_res["trust_info"]["level"] in ("HIGH", "MEDIUM") or eval_res["trust_info"]["score"] >= 0.7

    acc_summary = PlaceAccessibilitySummary(
        level=eval_res["level"],
        verified=verified,
        active_barriers_count=len(active_barriers),
        confidence=eval_res["trust_info"]["level"]
    )

    place_resp = PlaceResponse.model_validate(place)
    facilities_resp = [FacilityResponse.model_validate(f) for f in place.facilities]
    
    # Lazy loaded assistance points in repo
    from app.models.place import AssistancePoint
    from sqlalchemy import select
    res_ap = await db.execute(select(AssistancePoint).where(AssistancePoint.place_id == place_id))
    assistance_points = [AssistancePointResponse.model_validate(ap) for ap in res_ap.scalars().all()]

    details = PlaceDetailsResponse(
        place=place_resp,
        accessibility_summary=acc_summary,
        accessibility_records=[AccessibilityRecordResponse.model_validate(r) for r in place.accessibility_records],
        facilities=facilities_resp,
        assistance_points=assistance_points,
        active_barriers=active_barriers,
        trust_score=str(eval_res["trust_info"]["score"]),
        last_verified_at=place.updated_at
    )
    return ResponseWrapper(data=details)


@router.get("/{place_id}/accessibility", response_model=ResponseWrapper[dict])
async def get_place_accessibility(
    place_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    access_repo = AccessibilityRepository(db)
    records = await access_repo.get_records_for_place(place_id, exclude_expired=True)
    
    features = []
    for r in records:
        features.append({
            "feature": r.feature.value if hasattr(r.feature, "value") else r.feature,
            "status": r.status.value if hasattr(r.status, "value") else r.status,
            "confidence": r.confidence.value if hasattr(r.confidence, "value") else r.confidence,
            "source_type": r.source_type.value if hasattr(r.source_type, "value") else r.source_type,
            "last_verified_at": r.last_verified_at.isoformat() if r.last_verified_at else None
        })

    return ResponseWrapper(data={
        "place_id": str(place_id),
        "features": features
    })


@router.get("/{place_id}/facilities", response_model=ListResponseWrapper[FacilityResponse])
async def get_place_facilities(
    place_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    place_repo = PlaceRepository(db)
    place = await place_repo.get_by_id(place_id)
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found"
        )

    facilities = [FacilityResponse.model_validate(f) for f in place.facilities]
    meta = MetaInfo(page=1, page_size=len(facilities), total=len(facilities))
    return ListResponseWrapper(data=facilities, meta=meta)
