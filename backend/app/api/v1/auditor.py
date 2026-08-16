from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.barrier import BarrierRepository, ReportRepository, VerificationRepository
from app.services.verification_service import VerificationService
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.schemas.barrier import (
    VerifyReportRequest,
    RejectReportRequest,
    ResolveBarrierRequest,
    VerificationResponse,
    ReportResponse
)
from app.schemas.base import ResponseWrapper, ListResponseWrapper, MetaInfo

router = APIRouter(prefix="/auditor", tags=["Auditor"])


@router.get("/reports", response_model=ListResponseWrapper[ReportResponse])
async def list_reports_for_auditor(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify permissions (Auditor/Authority/Admin)
    user_role = getattr(current_user.role, "value", current_user.role)
    if user_role not in ("AUDITOR", "AUTHORITY", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to auditor reports"
        )

    report_repo = ReportRepository(db)
    reports, total = await report_repo.list_reports(
        status=status,
        page=page,
        page_size=page_size
    )
    res_list = [ReportResponse.model_validate(r) for r in reports]
    meta = MetaInfo(page=page, page_size=page_size, total=total)
    return ListResponseWrapper(data=res_list, meta=meta)


@router.post("/reports/{report_id}/verify", response_model=ResponseWrapper[dict])
async def verify_report(
    report_id: UUID,
    verify_req: VerifyReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = getattr(current_user.role, "value", current_user.role)
    if user_role not in ("AUDITOR", "AUTHORITY", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Only auditors/authorities can verify reports"
        )

    report_repo = ReportRepository(db)
    barrier_repo = BarrierRepository(db)
    verification_repo = VerificationRepository(db)

    report = await report_repo.get_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Heuristically determine barrier type from report
    barrier_type = "OTHER"
    title_upper = (report.title or "").upper()
    desc_upper = (report.description or "").upper()
    
    combined_text = f"{title_upper} {desc_upper}"
    if "ELEVATOR" in combined_text or "LIFT" in combined_text:
        barrier_type = "BROKEN_ELEVATOR"
    elif "RAMP" in combined_text:
        barrier_type = "BLOCKED_RAMP"
    elif "PATH" in combined_text or "ROAD" in combined_text or "WALKWAY" in combined_text or "STREET" in combined_text:
        barrier_type = "BLOCKED_PATH"
    elif "ENTRANCE" in combined_text or "GATE" in combined_text or "DOOR" in combined_text:
        barrier_type = "CLOSED_ENTRANCE"
    elif "CONSTRUCTION" in combined_text or "WORK" in combined_text or "DIGGING" in combined_text:
        barrier_type = "CONSTRUCTION"
    elif "PARKING" in combined_text:
        barrier_type = "PARKING_BLOCKED"
    elif "TOILET" in combined_text or "WASHROOM" in combined_text:
        barrier_type = "TOILET_UNAVAILABLE"

    verification_svc = VerificationService(
        report_repo=report_repo,
        barrier_repo=barrier_repo,
        verification_repo=verification_repo
    )

    barrier = await verification_svc.verify_report(
        report_id=report_id,
        verified_by=current_user.id,
        reason=verify_req.reason,
        barrier_type=barrier_type,
        severity="HIGH" if "CLOSED" in combined_text or "BLOCKED" in combined_text or "CRITICAL" in combined_text else "MEDIUM"
    )

    await db.commit()

    # Get the latest verification ID created
    verifications = await verification_repo.get_verifications_for_report(report_id)
    verification_id = verifications[0].id if verifications else uuid.uuid4()

    return ResponseWrapper(data={
        "report_id": str(report_id),
        "status": "VERIFIED",
        "verification_id": str(verification_id)
    })


@router.post("/reports/{report_id}/reject", response_model=ResponseWrapper[dict])
async def reject_report(
    report_id: UUID,
    reject_req: RejectReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = getattr(current_user.role, "value", current_user.role)
    if user_role not in ("AUDITOR", "AUTHORITY", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Only auditors/authorities can reject reports"
        )

    report_repo = ReportRepository(db)
    barrier_repo = BarrierRepository(db)
    verification_repo = VerificationRepository(db)

    verification_svc = VerificationService(
        report_repo=report_repo,
        barrier_repo=barrier_repo,
        verification_repo=verification_repo
    )

    report = await verification_svc.reject_report(
        report_id=report_id,
        verified_by=current_user.id,
        reason=reject_req.reason
    )

    await db.commit()

    return ResponseWrapper(data={
        "report_id": str(report_id),
        "status": "REJECTED"
    })


@router.post("/barriers/{barrier_id}/resolve", response_model=ResponseWrapper[dict])
async def resolve_barrier(
    barrier_id: UUID,
    resolve_req: ResolveBarrierRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = getattr(current_user.role, "value", current_user.role)
    if user_role not in ("AUDITOR", "AUTHORITY", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Only auditors/authorities can resolve barriers"
        )

    report_repo = ReportRepository(db)
    barrier_repo = BarrierRepository(db)
    verification_repo = VerificationRepository(db)

    verification_svc = VerificationService(
        report_repo=report_repo,
        barrier_repo=barrier_repo,
        verification_repo=verification_repo
    )

    barrier = await verification_svc.resolve_barrier(
        barrier_id=barrier_id,
        resolved_by=current_user.id,
        reason=resolve_req.reason
    )

    await db.commit()

    return ResponseWrapper(data={
        "barrier_id": str(barrier_id),
        "status": "RESOLVED"
    })
