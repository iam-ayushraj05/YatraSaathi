"""
yatrasaathi — AccessibilityRecord model.

Stores structured accessibility claims for a place.
UNKNOWN != AVAILABLE — never collapse to boolean.
"""
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import (
    AccessibilityFeature,
    AccessibilityStatus,
    ConfidenceLevel,
    SourceType,
)

if TYPE_CHECKING:
    from app.models.place import Place


class AccessibilityRecord(UUIDMixin, TimestampMixin, Base):
    """
    Structured accessibility claim for a place feature.

    Preserves: source, confidence, verification, freshness,
    temporary/permanent conditions, and explicit uncertainty.
    UNKNOWN ≠ AVAILABLE.
    """

    __tablename__ = "accessibility_records"

    place_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="CASCADE"), nullable=False
    )
    feature: Mapped[str] = mapped_column(
        String(50), nullable=False, default=AccessibilityFeature.OTHER.value
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=AccessibilityStatus.UNKNOWN.value
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[str] = mapped_column(
        String(20), nullable=False, default=ConfidenceLevel.UNKNOWN.value
    )
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=SourceType.UNKNOWN.value
    )
    source_reference: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # relationships
    place: Mapped["Place"] = relationship(
        "Place", back_populates="accessibility_records"
    )

    __table_args__ = (
        Index("idx_accessibility_place", "place_id"),
        Index("idx_accessibility_feature", "feature"),
        Index("idx_accessibility_status", "status"),
        Index("idx_accessibility_expires", "expires_at"),
    )
