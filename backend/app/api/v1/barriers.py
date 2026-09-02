"""
yatrasaathi — Real-Time Community Barrier Intelligence API.
Includes barrier report creation with live camera evidence, AI vision verification,
nearby community confirmation voting (YES/NO), duplicate detection, route impact analysis,
and WebSocket broadcasting.
"""
import math
import uuid
import json
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.core.database import get_db
from app.core.config import settings
from app.core.websocket_manager import ws_manager
from app.models.barrier import Barrier, Evidence
from app.models.barrier_vote import BarrierVote
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.repositories.barrier import BarrierRepository, EvidenceRepository
from app.services.trust_service import TrustService
from app.services.storage_service import save_barrier_photo
from app.services.barrier_ai_service import analyze_barrier_image
from app.schemas.base import ResponseWrapper, ListResponseWrapper, MetaInfo

router = APIRouter(prefix="/barriers", tags=["Barriers"])


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.websocket("/ws")
async def barrier_websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        await ws_manager.send_personal_message(
            {"event": "connected", "message": "Connected to YatraSaathi Live Barrier Intelligence Network"},
            websocket
        )
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


@router.get("/nearby", response_model=ListResponseWrapper[dict])
async def list_nearby_barriers(
    lat: float,
    lng: float,
    radius: float = 5000,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lng <= 180.0):
        raise HTTPException(
            status_code=400,
            detail="Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180."
        )

    barrier_repo = BarrierRepository(db)
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
        confirm_stmt = select(func.count()).select_from(BarrierVote).where(
            and_(BarrierVote.barrier_id == b.id, BarrierVote.confirmed == True)
        )
        reject_stmt = select(func.count()).select_from(BarrierVote).where(
            and_(BarrierVote.barrier_id == b.id, BarrierVote.confirmed == False)
        )
        confirm_res = await db.execute(confirm_stmt)
        reject_res = await db.execute(reject_stmt)
        confirmations = confirm_res.scalar_one() or 0
        rejections = reject_res.scalar_one() or 0

        total_votes = confirmations + rejections
        base_confidence = 0.65 if b.status in ["VERIFIED", "ACTIVE"] else 0.50
        if total_votes > 0:
            vote_ratio = confirmations / total_votes
            confidence_score = round(min(0.99, max(0.10, (base_confidence * 0.4) + (vote_ratio * 0.6))), 2)
        else:
            confidence_score = base_confidence

        photo_url = None
        evidence_stmt = select(Evidence).where(Evidence.barrier_id == b.id).order_by(Evidence.created_at.desc())
        ev_res = await db.execute(evidence_stmt)
        evidence_item = ev_res.scalars().first()
        if evidence_item and evidence_item.storage_key:
            photo_url = f"/static/barriers/{evidence_item.storage_key.split('/')[-1]}"

        b_lat, b_lng = lat, lng
        b_location = getattr(b, "location", None)
        if b_location and hasattr(b_location, "data"):
            try:
                from geoalchemy2.shape import to_shape
                point = to_shape(b_location)
                b_lat, b_lng = point.y, point.x
            except Exception:
                pass

        data.append({
            "id": str(b.id),
            "barrier_type": b.barrier_type,
            "title": b.title,
            "description": b.description,
            "severity": b.severity,
            "status": b.status,
            "latitude": b_lat,
            "longitude": b_lng,
            "distance_meters": round(dist, 1),
            "confidence_score": confidence_score,
            "confirmations_count": confirmations,
            "rejections_count": rejections,
            "photo_url": photo_url,
            "reported_at": b.reported_at.isoformat() if b.reported_at else None,
            "expires_at": b.expires_at.isoformat() if b.expires_at else None,
        })

    meta = MetaInfo(page=1, page_size=len(data), total=len(data))
    return ListResponseWrapper(data=data, meta=meta)


@router.get("/check-duplicate")
async def check_duplicate_barrier(
    lat: float,
    lng: float,
    barrier_type: str,
    radius: float = 100,
    db: AsyncSession = Depends(get_db)
):
    barrier_repo = BarrierRepository(db)
    nearby = await barrier_repo.nearby_barriers(
        lat=lat,
        lng=lng,
        radius_meters=radius,
        exclude_expired=True
    )

    duplicate = None
    for b, dist in nearby:
        if b.barrier_type.upper() == barrier_type.upper() or dist <= 50.0:
            duplicate = {
                "id": str(b.id),
                "title": b.title,
                "barrier_type": b.barrier_type,
                "severity": b.severity,
                "distance_meters": round(dist, 1),
                "status": b.status
            }
            break

    return ResponseWrapper(data={
        "duplicate_found": duplicate is not None,
        "existing_barrier": duplicate
    })


@router.post("", response_model=ResponseWrapper[dict])
async def create_barrier_report(
    barrier_type: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    severity: str = Form("MEDIUM"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    gps_accuracy: Optional[float] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not (-90.0 <= latitude <= 90.0) or not (-180.0 <= longitude <= 180.0):
        raise HTTPException(status_code=400, detail="Invalid GPS coordinates provided.")

    barrier_repo = BarrierRepository(db)
    evidence_repo = EvidenceRepository(db)

    barrier_data = {
        "barrier_type": barrier_type,
        "title": title,
        "description": description,
        "severity": severity.upper(),
        "location": {"lat": latitude, "lng": longitude},
        "status": "PENDING_REVIEW",
        "observed_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=48)
    }

    barrier = await barrier_repo.create_barrier(current_user.id, barrier_data)

    photo_url = None
    ai_result = None

    if photo:
        storage_key, photo_url, file_size, sha256_hash = await save_barrier_photo(photo)

        photo.file.seek(0)
        photo_bytes = await photo.read()
        ai_result = await analyze_barrier_image(
            image_bytes=photo_bytes,
            mime_type=photo.content_type or "image/jpeg",
            barrier_type=barrier_type,
            description=description,
            gemini_api_key=settings.llm_api_key or getattr(settings, "GEMINI_API_KEY", None)
        )

        evidence = await evidence_repo.create_evidence(
            uploaded_by=current_user.id,
            evidence_data={
                "storage_key": storage_key,
                "original_filename": photo.filename or "live_photo.jpg",
                "mime_type": photo.content_type or "image/jpeg",
                "file_size_bytes": file_size,
                "sha256_hash": sha256_hash,
                "ai_analysis": ai_result,
                "ai_confidence": ai_result.get("confidence", 0.5)
            },
            barrier_id=barrier.id
        )

        if ai_result.get("barrier_detected") and ai_result.get("confidence", 0) > 0.7:
            barrier.status = "VERIFIED"
            barrier.verified_at = datetime.now(timezone.utc)
        else:
            barrier.status = "PENDING_REVIEW"

    await db.commit()
    await db.refresh(barrier)

    event_payload = {
        "event": "barrier.created",
        "barrier": {
            "id": str(barrier.id),
            "barrier_type": barrier.barrier_type,
            "title": barrier.title,
            "description": barrier.description,
            "severity": barrier.severity,
            "status": barrier.status,
            "latitude": latitude,
            "longitude": longitude,
            "photo_url": photo_url,
            "ai_verified": ai_result.get("barrier_detected", False) if ai_result else False,
            "ai_confidence": ai_result.get("confidence", 0.5) if ai_result else 0.5,
            "created_at": barrier.created_at.isoformat()
        }
    }
    await ws_manager.broadcast(event_payload)

    return ResponseWrapper(data={
        "barrier_id": str(barrier.id),
        "status": barrier.status,
        "photo_url": photo_url,
        "ai_verification": ai_result,
        "message": "Barrier report submitted successfully with live camera evidence."
    })


@router.post("/{barrier_id}/verify", response_model=ResponseWrapper[dict])
async def vote_on_barrier(
    barrier_id: UUID,
    confirmed: bool = Form(...),
    user_lat: Optional[float] = Form(None),
    user_lng: Optional[float] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    barrier_repo = BarrierRepository(db)
    barrier = await barrier_repo.get_by_id(barrier_id)
    if not barrier:
        raise HTTPException(status_code=404, detail="Barrier not found")

    if barrier.reported_by == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot vote on your own reported barrier.")

    existing_vote_stmt = select(BarrierVote).where(
        and_(BarrierVote.barrier_id == barrier_id, BarrierVote.user_id == current_user.id)
    )
    res = await db.execute(existing_vote_stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already submitted a verification vote for this barrier.")

    vote = BarrierVote(
        barrier_id=barrier_id,
        user_id=current_user.id,
        confirmed=confirmed,
        user_lat=user_lat,
        user_lng=user_lng
    )
    db.add(vote)
    await db.flush()

    confirm_stmt = select(func.count()).select_from(BarrierVote).where(
        and_(BarrierVote.barrier_id == barrier_id, BarrierVote.confirmed == True)
    )
    reject_stmt = select(func.count()).select_from(BarrierVote).where(
        and_(BarrierVote.barrier_id == barrier_id, BarrierVote.confirmed == False)
    )
    c_res = await db.execute(confirm_stmt)
    r_res = await db.execute(reject_stmt)
    confirmations = c_res.scalar_one() or 0
    rejections = r_res.scalar_one() or 0

    total_votes = confirmations + rejections
    new_status = barrier.status

    if confirmations >= 3 and confirmations > (rejections * 2):
        new_status = "ACTIVE"
        barrier.verified_at = datetime.now(timezone.utc)
    elif rejections >= 3 and rejections >= confirmations:
        new_status = "RESOLVED"

    barrier.status = new_status
    await db.commit()

    vote_ratio = confirmations / max(1, total_votes)
    confidence_score = round(min(0.99, max(0.10, 0.4 + (vote_ratio * 0.6))), 2)

    await ws_manager.broadcast({
        "event": "barrier.confirmed" if confirmed else "barrier.rejected",
        "barrier_id": str(barrier_id),
        "status": new_status,
        "confirmations_count": confirmations,
        "rejections_count": rejections,
        "confidence_score": confidence_score
    })

    return ResponseWrapper(data={
        "barrier_id": str(barrier_id),
        "status": new_status,
        "confirmations_count": confirmations,
        "rejections_count": rejections,
        "confidence_score": confidence_score,
        "message": "Vote recorded successfully."
    })


@router.post("/route-impact")
async def check_route_impact(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    route_points = payload.get("route_geometry", [])
    if not route_points or len(route_points) < 2:
        return ResponseWrapper(data={"affected": False, "barriers": []})

    barrier_repo = BarrierRepository(db)
    lats = [p["lat"] for p in route_points if "lat" in p]
    lngs = [p["lng"] for p in route_points if "lng" in p]
    if not lats or not lngs:
        return ResponseWrapper(data={"affected": False, "barriers": []})

    center_lat = (min(lats) + max(lats)) / 2.0
    center_lng = (min(lngs) + max(lngs)) / 2.0

    nearby = await barrier_repo.nearby_barriers(
        lat=center_lat,
        lng=center_lng,
        radius_meters=10000,
        exclude_expired=True
    )

    affected_barriers = []
    for barrier, _ in nearby:
        if barrier.status in ["ACTIVE", "VERIFIED", "PENDING_REVIEW"]:
            b_lat, b_lng = center_lat, center_lng
            b_location = getattr(barrier, "location", None)
            if b_location and hasattr(b_location, "data"):
                try:
                    from geoalchemy2.shape import to_shape
                    point = to_shape(b_location)
                    b_lat, b_lng = point.y, point.x
                except Exception:
                    pass

            min_dist = min([calculate_haversine_distance(b_lat, b_lng, p["lat"], p["lng"]) for p in route_points if "lat" in p])
            if min_dist <= 80.0:
                affected_barriers.append({
                    "id": str(barrier.id),
                    "title": barrier.title,
                    "barrier_type": barrier.barrier_type,
                    "severity": barrier.severity,
                    "distance_to_route_meters": round(min_dist, 1),
                    "status": barrier.status
                })

    return ResponseWrapper(data={
        "affected": len(affected_barriers) > 0,
        "affected_count": len(affected_barriers),
        "barriers": affected_barriers,
        "recommendation": "Alternative step-free detour recommended" if affected_barriers else "Route is clear"
    })


@router.get("/heatmap")
async def get_accessibility_heatmap(
    lat: float = Query(28.6139),
    lng: float = Query(77.2090),
    radius: float = Query(10000),
    db: AsyncSession = Depends(get_db)
):
    barrier_repo = BarrierRepository(db)
    barriers = await barrier_repo.nearby_barriers(lat=lat, lng=lng, radius_meters=radius, exclude_expired=True)

    points = []
    for b, dist in barriers:
        weight = 0.9 if b.severity == "CRITICAL" else 0.7 if b.severity == "HIGH" else 0.4
        b_lat, b_lng = lat, lng
        b_location = getattr(b, "location", None)
        if b_location and hasattr(b_location, "data"):
            try:
                from geoalchemy2.shape import to_shape
                point = to_shape(b_location)
                b_lat, b_lng = point.y, point.x
            except Exception:
                pass

        points.append({
            "lat": b_lat,
            "lng": b_lng,
            "weight": weight,
            "barrier_type": b.barrier_type
        })

    return ResponseWrapper(data={"points": points, "total_points": len(points)})


@router.get("/user/reputation")
async def get_user_reputation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    reports_stmt = select(func.count()).select_from(Barrier).where(Barrier.reported_by == current_user.id)
    r_res = await db.execute(reports_stmt)
    reports_count = r_res.scalar_one() or 0

    verified_stmt = select(func.count()).select_from(Barrier).where(
        and_(Barrier.reported_by == current_user.id, Barrier.status.in_(["VERIFIED", "ACTIVE"]))
    )
    v_res = await db.execute(verified_stmt)
    verified_count = v_res.scalar_one() or 0

    votes_stmt = select(func.count()).select_from(BarrierVote).where(BarrierVote.user_id == current_user.id)
    vt_res = await db.execute(votes_stmt)
    votes_count = vt_res.scalar_one() or 0

    accuracy = round((verified_count / max(1, reports_count)) * 100) if reports_count > 0 else 92
    tier = "Trusted Community Contributor" if accuracy >= 80 else "Community Scout"

    return ResponseWrapper(data={
        "user_id": str(current_user.id),
        "display_name": current_user.display_name,
        "reports_submitted": reports_count,
        "verified_reports": verified_count,
        "confirmations_given": votes_count,
        "accuracy_percentage": accuracy,
        "contributor_tier": tier,
    })


@router.get("/{barrier_id}", response_model=ResponseWrapper[dict])
async def get_barrier_details(
    barrier_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    barrier_repo = BarrierRepository(db)
    trust_svc = TrustService()
    barrier = await barrier_repo.get_by_id(barrier_id)
    if not barrier:
        raise HTTPException(status_code=404, detail="Barrier not found")

    trust_info = await trust_svc.evaluate_trust(barrier)
    barrier_resp = {
        "id": str(barrier.id),
        "barrier_type": barrier.barrier_type,
        "title": barrier.title,
        "description": barrier.description,
        "severity": barrier.severity,
        "status": barrier.status,
        "observed_at": barrier.observed_at.isoformat() if barrier.observed_at else None,
        "expires_at": barrier.expires_at.isoformat() if barrier.expires_at else None,
        "trust_info": trust_info
    }

    return ResponseWrapper(data=barrier_resp)
