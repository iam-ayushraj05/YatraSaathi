"""
YatraSaathi — Route, RouteSegment, RouteConstraint, and RouteRequest schemas.
"""
from typing import Any, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.models.enums import ConfidenceLevel, AccessibilityStatus
from app.schemas.common import Coordinate
from app.schemas.place import parse_postgis_location


def parse_postgis_linestring(v: Any) -> Optional[list[Coordinate]]:
    """Helper to parse a PostGIS Geometry element representing a LineString to a list of Coordinates."""
    if v is None:
        return None
    if isinstance(v, list):
        return [Coordinate(**pt) if isinstance(pt, dict) else pt for pt in v]
    try:
        from geoalchemy2.shape import to_shape
        shape = to_shape(v)
        # shape.coords contains tuples (longitude, latitude)
        return [Coordinate(lat=pt[1], lng=pt[0]) for pt in shape.coords]
    except Exception:
        try:
            # WKT style like 'LINESTRING(lng1 lat1, lng2 lat2, ...)'
            v_str = str(v).upper()
            if "LINESTRING" in v_str:
                content = v_str.replace("LINESTRING", "").replace("(", "").replace(")", "").strip()
                coords = []
                for pt_str in content.split(","):
                    parts = pt_str.strip().split()
                    if len(parts) >= 2:
                        coords.append(Coordinate(lat=float(parts[1]), lng=float(parts[0])))
                return coords
        except Exception:
            pass
    return None


# ---------------------------------------------------------------------------
# RouteConstraint
# ---------------------------------------------------------------------------

class RouteConstraintBase(BaseModel):
    constraint_type: str
    value: Optional[dict] = Field(default_factory=dict)
    priority: int = 0


class RouteConstraintCreate(RouteConstraintBase):
    pass


class RouteConstraintResponse(RouteConstraintBase):
    id: UUID
    route_request_id: UUID

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# RouteRequest
# ---------------------------------------------------------------------------

class RouteRequestBase(BaseModel):
    preferences: Optional[dict] = Field(default_factory=dict)


class RouteRequestCreate(RouteRequestBase):
    origin: Coordinate
    destination: Coordinate
    profile_id: Optional[UUID] = None


class RouteRequestResponse(RouteRequestBase):
    id: UUID
    user_id: Optional[UUID] = None
    profile_id: Optional[UUID] = None
    origin: Coordinate
    destination: Coordinate
    requested_at: datetime

    @field_validator("origin", "destination", mode="before")
    @classmethod
    def validate_spatial_point(cls, v):
        parsed = parse_postgis_location(v)
        if parsed is None:
            raise ValueError("Invalid spatial coordinate point")
        return parsed

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# RouteSegment
# ---------------------------------------------------------------------------

class RouteSegmentBase(BaseModel):
    sequence: int
    distance_meters: Decimal
    duration_seconds: int
    surface_type: Optional[str] = None
    stairs_count: Optional[int] = None
    accessibility_status: AccessibilityStatus = AccessibilityStatus.UNKNOWN
    barrier_count: int = 0
    extra_data: Optional[dict] = Field(default_factory=dict)


class RouteSegmentCreate(RouteSegmentBase):
    geometry: list[Coordinate]


class RouteSegmentResponse(RouteSegmentBase):
    id: UUID
    route_id: UUID
    geometry: list[Coordinate]

    @field_validator("geometry", mode="before")
    @classmethod
    def validate_linestring_geom(cls, v):
        parsed = parse_postgis_linestring(v)
        if parsed is None:
            raise ValueError("Invalid spatial geometry path (LineString)")
        return parsed

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

class RouteBase(BaseModel):
    provider: str = "demo"
    provider_route_id: Optional[str] = None
    distance_meters: Decimal
    duration_seconds: int
    accessibility_score: Optional[Decimal] = None
    walking_distance_meters: Optional[Decimal] = None
    stairs_count: Optional[int] = None
    barrier_count: int = 0
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN
    ranking_reason: Optional[dict] = Field(default_factory=dict)


class RouteCreate(RouteBase):
    geometry: list[Coordinate]


class RouteResponse(RouteBase):
    id: UUID
    route_request_id: UUID
    geometry: list[Coordinate]
    created_at: datetime
    # Nested segments can be populated if requested
    segments: list[RouteSegmentResponse] = Field(default_factory=list)

    @field_validator("geometry", mode="before")
    @classmethod
    def validate_linestring_geom(cls, v):
        parsed = parse_postgis_linestring(v)
        if parsed is None:
            raise ValueError("Invalid spatial geometry path (LineString)")
        return parsed

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# API Route Planning Requests & Responses
# ---------------------------------------------------------------------------

class RoutePlanRequest(BaseModel):
    origin: Coordinate
    destination: Coordinate
    profile_id: Optional[UUID] = None
    preferences: Optional[dict] = Field(default_factory=dict)


class RoutePlanResponse(BaseModel):
    request_id: UUID
    routes: list[RouteResponse] = Field(default_factory=list)
