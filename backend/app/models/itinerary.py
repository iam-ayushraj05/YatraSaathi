"""
YatraSaathi — Itinerary and ItineraryStop models.
"""
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import ItinerarySource, ItineraryStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.place import Place


class Itinerary(UUIDMixin, TimestampMixin, Base):
    """
    Multi-stop travel plan.
    AI-generated itineraries must remain editable.
    """

    __tablename__ = "itineraries"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    start_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    end_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ItineraryStatus.DRAFT.value
    )
    generated_by: Mapped[str] = mapped_column(
        String(30), nullable=False, default=ItinerarySource.USER_CREATED.value
    )

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="itineraries")
    stops: Mapped[list["ItineraryStop"]] = relationship(
        "ItineraryStop",
        back_populates="itinerary",
        cascade="all, delete-orphan",
        order_by="ItineraryStop.sequence",
    )

    __table_args__ = (
        Index("idx_itineraries_user", "user_id"),
        Index("idx_itineraries_status", "status"),
    )


class ItineraryStop(UUIDMixin, TimestampMixin, Base):
    """
    Individual stop within an itinerary.

    accessibility_snapshot stores what the system knew when the itinerary
    was created — accessibility info can change later.
    """

    __tablename__ = "itinerary_stops"

    itinerary_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("itineraries.id", ondelete="CASCADE"),
        nullable=False,
    )
    place_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="RESTRICT"), nullable=False
    )
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    planned_start: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    planned_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Snapshot of accessibility state at itinerary-creation time
    accessibility_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # relationships
    itinerary: Mapped["Itinerary"] = relationship("Itinerary", back_populates="stops")
    place: Mapped["Place"] = relationship("Place", back_populates="itinerary_stops")

    __table_args__ = (
        Index("idx_itinerary_stops_itinerary", "itinerary_id"),
        Index("idx_itinerary_stops_place", "place_id"),
    )
