"""
YatraSaathi — Report, Barrier, Evidence, EvidenceObservation, and Verification schemas.
"""
from typing import Optional, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

from app.models.enums import (
    ReportType,
    ReportStatus,
    BarrierType,
    BarrierSeverity,
    BarrierStatus,
    VerificationAction,
    ConfidenceLevel,
)
from app.schemas.common import Coordinate
from app.schemas.place import parse_postgis_location


# ---------------------------------------------------------------------------
# Report Schemas
# ---------------------------------------------------------------------------


class ReportBase(BaseModel):
    report_type: ReportType
    place_id: Optional[UUID] = None
    title: str = Field(..., max_length=255)
    description: str


class ReportCreate(ReportBase):
    location: Optional[Coordinate] = None


class ReportResponse(ReportBase):
    id: UUID
    user_id: UUID
    location: Optional[Coordinate] = None
    status: ReportStatus
    created_at: datetime
    updated_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def validate_location(cls, v):
        return parse_postgis_location(v)

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Barrier Schemas
# ---------------------------------------------------------------------------


class BarrierBase(BaseModel):
    barrier_type: BarrierType
    title: str = Field(..., max_length=255)
    description: str
    severity: BarrierSeverity = BarrierSeverity.MEDIUM


class BarrierCreate(BarrierBase):
    place_id: Optional[UUID] = None
    report_id: Optional[UUID] = None
    location: Coordinate
    observed_at: datetime
    expires_at: Optional[datetime] = None


class BarrierResponse(BarrierBase):
    id: UUID
    place_id: Optional[UUID] = None
    reported_by: UUID
    report_id: Optional[UUID] = None
    location: Coordinate
    status: BarrierStatus
    observed_at: datetime
    reported_at: datetime
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN
    created_at: datetime
    updated_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def validate_location(cls, v):
        parsed = parse_postgis_location(v)
        if parsed is None:
            raise ValueError("Invalid spatial location coordinate.")
        return parsed

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Evidence & Observation Schemas
# ---------------------------------------------------------------------------


class EvidenceBase(BaseModel):
    original_filename: str
    mime_type: str
    file_size_bytes: int


class EvidenceResponse(EvidenceBase):
    id: UUID
    report_id: Optional[UUID] = None
    barrier_id: Optional[UUID] = None
    uploaded_by: UUID
    storage_key: str
    sha256_hash: str
    ai_analysis: Optional[dict] = Field(default_factory=dict)
    ai_confidence: Optional[Decimal] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EvidenceObservationBase(BaseModel):
    model_name: str
    observation_type: str
    observation: str
    confidence: Optional[Decimal] = None


class EvidenceObservationResponse(EvidenceObservationBase):
    id: UUID
    evidence_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Verification Schemas
# ---------------------------------------------------------------------------


class VerificationBase(BaseModel):
    action: VerificationAction
    reason: str


class VerifyReportRequest(BaseModel):
    action: VerificationAction = VerificationAction.VERIFY
    reason: str = Field(..., min_length=5)


class RejectReportRequest(BaseModel):
    reason: str = Field(..., min_length=5)


class ResolveBarrierRequest(BaseModel):
    reason: str = Field(..., min_length=5)


class VerificationResponse(VerificationBase):
    id: UUID
    report_id: Optional[UUID] = None
    barrier_id: Optional[UUID] = None
    verified_by: UUID
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
