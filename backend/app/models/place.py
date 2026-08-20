"""
yatrasaathi — Place, Facility, and AssistancePoint models.
"""
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from geoalchemy2 import Geography
from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin, utcnow
from app.models.enums import (
    AssistanceType,
    AvailabilityStatus,
    FacilityType,
    PlaceCategory,
    RecordStatus,
    SourceType,
)

if TYPE_CHECKING:
    from app.models.accessibility import AccessibilityRecord
    from app.models.barrier import Barrier
    from app.models.report import Report
    from app.models.crowd import CrowdObservation
    from app.models.itinerary import ItineraryStop


class Place(UUIDMixin, TimestampMixin, Base):
    """Tourist destination or point of interest."""

    __tablename__ = "places"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, default=PlaceCategory.OTHER.value
    )
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    # PostGIS geography point — SRID 4326
    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False
    )
    website_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    opening_hours: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=SourceType.DEMO.value
    )
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_reference: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=RecordStatus.ACTIVE.value
    )

    # relationships (string refs avoid circular imports)
    accessibility_records: Mapped[list["AccessibilityRecord"]] = relationship(
        "AccessibilityRecord", back_populates="place", cascade="all, delete-orphan"
    )
    facilities: Mapped[list["Facility"]] = relationship(
        "Facility", back_populates="place", cascade="all, delete-orphan"
    )
    barriers: Mapped[list["Barrier"]] = relationship("Barrier", back_populates="place")
    assistance_points: Mapped[list["AssistancePoint"]] = relationship(
        "AssistancePoint", back_populates="place", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="place")
    crowd_observations: Mapped[list["CrowdObservation"]] = relationship(
        "CrowdObservation", back_populates="place", cascade="all, delete-orphan"
    )
    itinerary_stops: Mapped[list["ItineraryStop"]] = relationship(
        "ItineraryStop", back_populates="place"
    )

    __table_args__ = (
        Index("idx_places_location", "location", postgresql_using="gist"),
        Index("idx_places_status", "status"),
        Index("idx_places_category", "category"),
    )


class Facility(UUIDMixin, TimestampMixin, Base):
    """Physical or service facility attached to a place."""

    __tablename__ = "facilities"

    place_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="CASCADE"), nullable=False
    )
    facility_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=FacilityType.OTHER.value
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[object]] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=RecordStatus.ACTIVE.value
    )
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=SourceType.DEMO.value
    )
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # relationships
    place: Mapped["Place"] = relationship("Place", back_populates="facilities")

    __table_args__ = (
        Index("idx_facilities_place", "place_id"),
        Index("idx_facilities_type", "facility_type"),
        Index("idx_facilities_location", "location", postgresql_using="gist"),
    )


class AssistancePoint(UUIDMixin, TimestampMixin, Base):
    """On-site assistance point for travellers."""

    __tablename__ = "assistance_points"

    place_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    assistance_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=AssistanceType.OTHER.value
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False
    )
    availability_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=AvailabilityStatus.UNKNOWN.value
    )
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=SourceType.DEMO.value
    )
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # relationships
    place: Mapped[Optional["Place"]] = relationship(
        "Place", back_populates="assistance_points"
    )

    __table_args__ = (
        Index(
            "idx_assistance_points_location", "location", postgresql_using="gist"
        ),
        Index("idx_assistance_points_place", "place_id"),
        Index("idx_assistance_points_type", "assistance_type"),
    )
