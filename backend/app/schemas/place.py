"""
YatraSaathi — Place, Facility, AssistancePoint, and AccessibilityRecord schemas.
"""
from typing import Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_serializer, ConfigDict

from app.models.enums import (
    PlaceCategory,
    AccessibilityFeature,
    AccessibilityStatus,
    FacilityType,
    AssistanceType,
    AvailabilityStatus,
    SourceType,
    ConfidenceLevel,
    RecordStatus,
)
from app.schemas.common import Coordinate


def parse_postgis_location(v: Any) -> Optional[Coordinate]:
    """Helper to parse a PostGIS Geography element to a Coordinate schema."""
    if v is None:
        return None
    if isinstance(v, dict):
        return Coordinate(**v)
    if isinstance(v, Coordinate):
        return v
    try:
        from geoalchemy2.shape import to_shape
        shape = to_shape(v)
        # shape.x is longitude, shape.y is latitude
        return Coordinate(lat=shape.y, lng=shape.x)
    except Exception:
        # Fallback in case of string parsing
        try:
            # WKT style like 'POINT(lng lat)'
            v_str = str(v).upper()
            if "POINT" in v_str:
                parts = v_str.replace("POINT", "").replace("(", "").replace(")", "").strip().split()
                if len(parts) >= 2:
                    return Coordinate(lat=float(parts[1]), lng=float(parts[0]))
        except Exception:
            pass
    return None


# ---------------------------------------------------------------------------
# AccessibilityRecord
# ---------------------------------------------------------------------------


class AccessibilityRecordBase(BaseModel):
    feature: AccessibilityFeature
    status: AccessibilityStatus
    description: Optional[str] = None
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN
    source_type: SourceType = SourceType.DEMO
    source_reference: Optional[str] = None
    expires_at: Optional[datetime] = None


class AccessibilityRecordCreate(AccessibilityRecordBase):
    pass


class AccessibilityRecordResponse(AccessibilityRecordBase):
    id: UUID
    place_id: UUID
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Facility
# ---------------------------------------------------------------------------


class FacilityBase(BaseModel):
    facility_type: FacilityType
    name: str
    description: Optional[str] = None
    status: RecordStatus = RecordStatus.ACTIVE
    source_type: SourceType = SourceType.DEMO


class FacilityCreate(FacilityBase):
    location: Optional[Coordinate] = None


class FacilityResponse(FacilityBase):
    id: UUID
    place_id: UUID
    location: Optional[Coordinate] = None
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def validate_location(cls, v):
        return parse_postgis_location(v)

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# AssistancePoint
# ---------------------------------------------------------------------------


class AssistancePointBase(BaseModel):
    name: str
    assistance_type: AssistanceType
    description: Optional[str] = None
    availability_status: AvailabilityStatus = AvailabilityStatus.UNKNOWN
    source_type: SourceType = SourceType.DEMO


class AssistancePointCreate(AssistancePointBase):
    location: Coordinate


class AssistancePointResponse(AssistancePointBase):
    id: UUID
    place_id: Optional[UUID] = None
    location: Coordinate
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def validate_location(cls, v):
        parsed = parse_postgis_location(v)
        if parsed is None:
            raise ValueError("Invalid spatial location coordinate.")
        return parsed

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Place
# ---------------------------------------------------------------------------


class PlaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: PlaceCategory = PlaceCategory.OTHER
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: str = "India"
    website_url: Optional[str] = None
    phone: Optional[str] = None
    opening_hours: Optional[dict] = Field(default_factory=dict)
    source_type: SourceType = SourceType.DEMO
    source_url: Optional[str] = None
    source_reference: Optional[str] = None
    status: RecordStatus = RecordStatus.ACTIVE


class PlaceCreate(PlaceBase):
    location: Coordinate


class PlaceResponse(PlaceBase):
    id: UUID
    location: Coordinate
    created_at: datetime
    updated_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def validate_location(cls, v):
        parsed = parse_postgis_location(v)
        if parsed is None:
            raise ValueError("Invalid spatial location coordinate.")
        return parsed

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Place Details Aggregated Response
# ---------------------------------------------------------------------------


class PlaceAccessibilitySummary(BaseModel):
    level: str = "UNKNOWN"  # HIGH, MEDIUM, LOW, UNKNOWN
    verified: bool = False
    active_barriers_count: int = 0
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN


class PlaceDetailsResponse(BaseModel):
    place: PlaceResponse
    accessibility_summary: PlaceAccessibilitySummary
    accessibility_records: list[AccessibilityRecordResponse] = Field(default_factory=list)
    facilities: list[FacilityResponse] = Field(default_factory=list)
    assistance_points: list[AssistancePointResponse] = Field(default_factory=list)
    active_barriers: list[Any] = Field(default_factory=list)  # Any to avoid circular refs, populated by barrier response
    trust_score: str = "UNKNOWN"
    last_verified_at: Optional[datetime] = None
