"""
yatrasaathi — User and accessibility profile models.
"""
import uuid
from typing import Optional, TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import RouteStyle, UserRole

if TYPE_CHECKING:
    from app.models.barrier import Barrier, Evidence, Verification
    from app.models.report import Report  # noqa: F401 – resolved at runtime via barrier.py
    from app.models.route import RouteRequest
    from app.models.itinerary import Itinerary
    from app.models.audit import AuditLog


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(50), nullable=False, default="EMAIL")  # EMAIL, GOOGLE, PHONE
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    travel_style: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # SOLO, FAMILY, FRIENDS, BUSINESS, ASSISTED
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=350)
    saved_places: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True, default=list)
    saved_journeys: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True, default=list)
    role: Mapped[str] = mapped_column(
        String(50), nullable=False, default=UserRole.TRAVELLER.value
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # relationships
    accessibility_profile: Mapped[Optional["AccessibilityProfile"]] = relationship(
        "AccessibilityProfile", back_populates="user", uselist=False
    )
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="user")
    itineraries: Mapped[list["Itinerary"]] = relationship(
        "Itinerary", back_populates="user"
    )
    barriers_reported: Mapped[list["Barrier"]] = relationship(
        "Barrier",
        back_populates="reporter",
        foreign_keys="Barrier.reported_by",
    )
    evidence_uploaded: Mapped[list["Evidence"]] = relationship(
        "Evidence", back_populates="uploader"
    )
    verifications_performed: Mapped[list["Verification"]] = relationship(
        "Verification", back_populates="verifier"
    )
    route_requests: Mapped[list["RouteRequest"]] = relationship(
        "RouteRequest", back_populates="user"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="actor"
    )
    voice_usages: Mapped[list["VoiceUsage"]] = relationship(
        "VoiceUsage", back_populates="user"
    )


class AccessibilityProfile(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "accessibility_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True
    )
    mobility_preferences: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    vision_preferences: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    hearing_preferences: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    cognitive_preferences: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    walking_limit_meters: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    avoid_stairs: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    prefer_step_free: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    prefer_rest_stops: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    preferred_route_style: Mapped[str] = mapped_column(
        String(50), nullable=False, default=RouteStyle.MOST_ACCESSIBLE.value
    )

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="accessibility_profile")
    route_requests: Mapped[list["RouteRequest"]] = relationship(
        "RouteRequest",
        back_populates=None,
        foreign_keys="RouteRequest.profile_id",
        primaryjoin="AccessibilityProfile.id == RouteRequest.profile_id",
    )
