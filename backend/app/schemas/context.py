"""
YatraSaathi — Weather and Crowd/Context schemas.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.models.enums import CrowdLevel, SourceType, ConfidenceLevel
from app.schemas.common import Coordinate
from app.schemas.place import parse_postgis_location


# ---------------------------------------------------------------------------
# WeatherSnapshot
# ---------------------------------------------------------------------------

class WeatherSnapshotBase(BaseModel):
    provider: str = "demo"
    condition: str
    temperature_c: Decimal
    rain_probability: Optional[Decimal] = None
    wind_speed_kph: Optional[Decimal] = None
    observed_at: datetime
    expires_at: Optional[datetime] = None
    raw_metadata: Optional[dict] = Field(default_factory=dict)


class WeatherSnapshotCreate(WeatherSnapshotBase):
    location: Coordinate


class WeatherSnapshotResponse(WeatherSnapshotBase):
    id: UUID
    location: Coordinate
    created_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def validate_location(cls, v):
        parsed = parse_postgis_location(v)
        if parsed is None:
            raise ValueError("Invalid spatial coordinate point")
        return parsed

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# CrowdObservation
# ---------------------------------------------------------------------------

class CrowdObservationBase(BaseModel):
    crowd_level: CrowdLevel = CrowdLevel.UNKNOWN
    source_type: SourceType = SourceType.DEMO
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN
    observed_at: datetime
    expires_at: Optional[datetime] = None
    extra_data: Optional[dict] = Field(default_factory=dict)


class CrowdObservationCreate(CrowdObservationBase):
    place_id: UUID


class CrowdObservationResponse(CrowdObservationBase):
    id: UUID
    place_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
