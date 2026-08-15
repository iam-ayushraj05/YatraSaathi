"""
YatraSaathi — Route, RouteSegment, RouteConstraint, and RouteRequest models.
"""
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from decimal import Decimal

from geoalchemy2 import Geography, Geometry
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, utcnow
from app.models.enums import AccessibilityStatus, ConfidenceLevel

if TYPE_CHECKING:
    from app.models.user import User


# ---------------------------------------------------------------------------
# RouteRequest
# ---------------------------------------------------------------------------


class RouteRequest(UUIDMixin, Base):
    """
    Captures what the user asked for.
    Contains geospatial origin/destination and user preferences.
    """

    __tablename__ = "route_requests"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    profile_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("accessibility_profiles.id", ondelete="SET NULL"),
        nullable=True,
    )
    origin: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False
    )
    destination: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False
    )
    preferences: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    # relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="route_requests"
    )
    routes: Mapped[list["Route"]] = relationship(
        "Route", back_populates="route_request", cascade="all, delete-orphan"
    )
    constraints: Mapped[list["RouteConstraint"]] = relationship(
        "RouteConstraint", back_populates="route_request", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_route_requests_user", "user_id"),
        Index("idx_route_requests_at", "requested_at"),
        Index("idx_route_requests_origin", "origin", postgresql_using="gist"),
        Index("idx_route_requests_destination", "destination", postgresql_using="gist"),
    )


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------


class Route(UUIDMixin, Base):
    """
    A scored, accessibility-annotated route returned for a request.
    Geometry is LINESTRING 4326 (geometry, not geography) for PostGIS ops.
    """

    __tablename__ = "routes"

    route_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("route_requests.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="demo")
    provider_route_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    geometry: Mapped[object] = mapped_column(
        Geometry(geometry_type="LINESTRING", srid=4326, spatial_index=False), nullable=False
    )
    distance_meters: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    accessibility_score: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    walking_distance_meters: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    stairs_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    barrier_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    confidence: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ConfidenceLevel.UNKNOWN.value
    )
    ranking_reason: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    # relationships
    route_request: Mapped["RouteRequest"] = relationship(
        "RouteRequest", back_populates="routes"
    )
    segments: Mapped[list["RouteSegment"]] = relationship(
        "RouteSegment", back_populates="route", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_routes_request", "route_request_id"),
        Index("idx_routes_score", "accessibility_score"),
        Index("idx_routes_geometry", "geometry", postgresql_using="gist"),
    )


# ---------------------------------------------------------------------------
# RouteSegment
# ---------------------------------------------------------------------------


class RouteSegment(UUIDMixin, Base):
    """
    Segment-level accessibility analysis.
    Enables per-segment barrier and surface annotations.
    """

    __tablename__ = "route_segments"

    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("routes.id", ondelete="CASCADE"),
        nullable=False,
    )
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    geometry: Mapped[object] = mapped_column(
        Geometry(geometry_type="LINESTRING", srid=4326, spatial_index=False), nullable=False
    )
    distance_meters: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    surface_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    stairs_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    accessibility_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=AccessibilityStatus.UNKNOWN.value
    )
    barrier_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # relationships
    route: Mapped["Route"] = relationship("Route", back_populates="segments")

    __table_args__ = (
        Index(
            "idx_route_segments_geometry", "geometry", postgresql_using="gist"
        ),
        Index("idx_route_segments_route", "route_id"),
    )


# ---------------------------------------------------------------------------
# RouteConstraint
# ---------------------------------------------------------------------------


class RouteConstraint(UUIDMixin, Base):
    """
    Normalised constraints on a route request.
    Examples: AVOID_STAIRS, MAX_WALKING_DISTANCE, REQUIRE_STEP_FREE.
    """

    __tablename__ = "route_constraints"

    route_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("route_requests.id", ondelete="CASCADE"),
        nullable=False,
    )
    constraint_type: Mapped[str] = mapped_column(String(80), nullable=False)
    value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships
    route_request: Mapped["RouteRequest"] = relationship(
        "RouteRequest", back_populates="constraints"
    )

    __table_args__ = (
        Index("idx_route_constraints_request", "route_request_id"),
    )
