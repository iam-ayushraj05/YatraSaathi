import hashlib
import uuid
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.barrier import ReportRepository, EvidenceRepository
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.schemas.barrier import (
    ReportCreate,
    ReportResponse,
    EvidenceResponse
)
from app.schemas.base import ResponseWrapper, ListResponseWrapper, MetaInfo

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ResponseWrapper[ReportResponse])
async def create_report(
    report_in: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report_repo = ReportRepository(db)
    
    # Optional place validation if place_id is passed
    if report_in.place_id:
        from app.repositories.place import PlaceRepository
        place_repo = PlaceRepository(db)
        place = await place_repo.get_by_id(report_in.place_id)
        if not place:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced place not found"
            )

    report = await report_repo.create_report(current_user.id, report_in.model_dump())
    await db.commit()
    await db.refresh(report)
    return ResponseWrapper(data=ReportResponse.model_validate(report))


@router.post("/{report_id}/evidence", response_model=ResponseWrapper[EvidenceResponse])
async def upload_evidence(
    report_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report_repo = ReportRepository(db)
    report = await report_repo.get_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Validate file type and size
    allowed_types = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type {file.content_type}. Only JPEG, PNG, WEBP, and PDF are allowed."
        )

    content = await file.read()
    max_size = 10 * 1024 * 1024  # 10MB
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit."
        )

    file_hash = hashlib.sha256(content).hexdigest()
    storage_key = f"evidence/{uuid.uuid4()}-{file.filename}"

    evidence_repo = EvidenceRepository(db)
    evidence_data = {
        "storage_key": storage_key,
        "original_filename": file.filename,
        "mime_type": file.content_type,
        "file_size_bytes": len(content),
        "sha256_hash": file_hash,
        "ai_analysis": {"observation": "Simulated AI scan complete", "status": "PENDING"},
        "ai_confidence": 0.95
    }
    evidence = await evidence_repo.create_evidence(
        uploaded_by=current_user.id,
        evidence_data=evidence_data,
        report_id=report_id
    )
    await db.commit()
    await db.refresh(evidence)
    return ResponseWrapper(data=EvidenceResponse.model_validate(evidence))


@router.get("/me", response_model=ListResponseWrapper[ReportResponse])
async def get_my_reports(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report_repo = ReportRepository(db)
    reports, total = await report_repo.list_reports(
        user_id=current_user.id,
        status=status,
        page=page,
        page_size=page_size
    )
    res_list = [ReportResponse.model_validate(r) for r in reports]
    meta = MetaInfo(page=page, page_size=page_size, total=total)
    return ListResponseWrapper(data=res_list, meta=meta)
