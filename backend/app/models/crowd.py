"""
YatraSaathi — CrowdObservation model.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, utcnow
from app.models.enums import ConfidenceLevel, CrowdLevel, SourceType

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.place import Place


class CrowdObservation(UUIDMixin, Base):
    """
    Crowd-level observation for a place.
    Demo observations must be clearly labelled via source_type=DEMO.
    """

    __tablename__ = "crowd_observations"

    place_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("places.id", ondelete="CASCADE"),
        nullable=False,
    )
    crowd_level: Mapped[str] = mapped_column(
        String(20), nullable=False, default=CrowdLevel.UNKNOWN.value
    )
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=SourceType.DEMO.value
    )
    confidence: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ConfidenceLevel.UNKNOWN.value
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    # relationships
    place: Mapped["Place"] = relationship("Place", back_populates="crowd_observations")

    __table_args__ = (
        Index("idx_crowd_place", "place_id"),
        Index("idx_crowd_observed", "observed_at"),
        Index("idx_crowd_expires", "expires_at"),
    )
