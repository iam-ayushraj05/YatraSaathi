from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.route import RouteRepository
from app.repositories.barrier import BarrierRepository
from app.repositories.accessibility import AccessibilityRepository
from app.services.route_service import RouteService
from app.services.scoring_service import ScoringService
from app.services.context_service import ContextService
from app.services.barrier_service import BarrierService
from app.services.trust_service import TrustService
from app.repositories.context import ContextRepository
from app.models.user import User, AccessibilityProfile
from app.api.v1.auth import get_current_user
from app.schemas.route import (
    RoutePlanRequest,
    RoutePlanResponse,
    RouteResponse,
    parse_postgis_linestring
)
from app.schemas.base import ResponseWrapper
from app.schemas.place import parse_postgis_location

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.post("/plan", response_model=ResponseWrapper[RoutePlanResponse])
async def plan_route(
    plan_req: RoutePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve profile if profile_id provided, otherwise construct default
    profile = None
    if plan_req.profile_id:
        from app.repositories.user import UserRepository
        user_repo = UserRepository(db)
        profile = await user_repo.get_profile_by_id(plan_req.profile_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Accessibility profile not found"
            )
    else:
        # Check if current user has a profile
        from app.repositories.user import UserRepository
        user_repo = UserRepository(db)
        profile = await user_repo.get_profile_by_user_id(current_user.id) if current_user else None
        if not profile:
            profile = AccessibilityProfile(
                avoid_stairs=plan_req.preferences.get("avoid_stairs", False),
                prefer_step_free=plan_req.preferences.get("prefer_step_free", False),
                walking_limit_meters=plan_req.preferences.get("walking_limit_meters")
            )

    # Initialize services
    route_repo = RouteRepository(db)
    barrier_repo = BarrierRepository(db)
    context_repo = ContextRepository(db)
    
    scoring_svc = ScoringService()
    context_svc = ContextService(context_repo)
    trust_svc = TrustService()
    barrier_svc = BarrierService(barrier_repo, trust_svc)
    
    route_svc = RouteService(
        route_repo=route_repo,
        barrier_repo=barrier_repo,
        scoring_service=scoring_svc,
        context_service=context_svc
    )

    # Call service
    plan_res = await route_svc.plan_route(
        user_id=current_user.id if current_user else None,
        profile=profile,
        origin=plan_req.origin.model_dump(),
        destination=plan_req.destination.model_dump(),
        preferences=plan_req.preferences
    )
    
    await db.commit()

    # Load complete route responses (including segments)
    routes_list = []
    for alt in plan_res["alternatives"]:
        route_obj = await route_repo.get_route(alt["id"])
        routes_list.append(RouteResponse.model_validate(route_obj))

    plan_resp = RoutePlanResponse(
        request_id=plan_res["request_id"],
        routes=routes_list
    )
    return ResponseWrapper(data=plan_resp)


@router.get("/{route_id}", response_model=ResponseWrapper[RouteResponse])
async def get_route(
    route_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    route_repo = RouteRepository(db)
    route = await route_repo.get_route(route_id)
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    return ResponseWrapper(data=RouteResponse.model_validate(route))


@router.post("/{route_id}/recalculate", response_model=ResponseWrapper[dict])
async def recalculate_route(
    route_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Initialize services
    route_repo = RouteRepository(db)
    barrier_repo = BarrierRepository(db)
    context_repo = ContextRepository(db)
    
    scoring_svc = ScoringService()
    context_svc = ContextService(context_repo)
    
    route_svc = RouteService(
        route_repo=route_repo,
        barrier_repo=barrier_repo,
        scoring_service=scoring_svc,
        context_service=context_svc
    )

    previous_route = await route_repo.get_route(route_id)
    if not previous_route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Previous route not found"
        )

    # Resolve profile
    profile = None
    if previous_route.route_request_id:
        req = await route_repo.get_route_request(previous_route.route_request_id)
        if req and req.profile_id:
            from app.repositories.user import UserRepository
            user_repo = UserRepository(db)
            profile = await user_repo.get_profile_by_id(req.profile_id)
    
    if not profile:
        profile = AccessibilityProfile()

    # Recalculate
    recalc_res = await route_svc.recalculate_route(
        previous_route_id=route_id,
        user_id=current_user.id if current_user else None,
        profile=profile
    )
    
    await db.commit()

    # Format routes list
    routes_list = []
    for alt in recalc_res["all_alternatives"]:
        route_obj = await route_repo.get_route(alt["id"])
        routes_list.append(RouteResponse.model_validate(route_obj).model_dump())

    data = {
        "previous_route_id": str(route_id),
        "previous_route_affected": recalc_res["previous_route_affected"],
        "reason": recalc_res["reason"],
        "routes": routes_list
    }
    return ResponseWrapper(data=data)


# Internal route impact endpoint
@router.post("/internal/{route_id}/impact", response_model=ResponseWrapper[dict])
async def check_route_impact(
    route_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    route_repo = RouteRepository(db)
    barrier_repo = BarrierRepository(db)

    route = await route_repo.get_route(route_id)
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )

    prev_coords = parse_postgis_linestring(route.geometry)
    from app.repositories.route import coords_to_wkt_linestring
    prev_wkt = coords_to_wkt_linestring(prev_coords)

    active_barriers = await barrier_repo.get_barriers_near_geometry(prev_wkt, buffer_meters=15.0)
    
    affected = len(active_barriers) > 0
    severity = "NONE"
    recommended_action = "NONE"

    if affected:
        severities = [b.severity for b in active_barriers]
        if "CRITICAL" in severities or "HIGH" in severities:
            severity = "HIGH"
            recommended_action = "RECALCULATE"
        elif "MEDIUM" in severities:
            severity = "MEDIUM"
            recommended_action = "MONITOR"
        else:
            severity = "LOW"
            recommended_action = "MONITOR"

    return ResponseWrapper(data={
        "affected": affected,
        "severity": severity,
        "recommended_action": recommended_action
    })
