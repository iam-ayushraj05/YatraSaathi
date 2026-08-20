"""
yatrasaathi — Barrier, Evidence, EvidenceObservation, and Verification models.
"""
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from decimal import Decimal

# pyrefly: ignore [missing-import]
from geoalchemy2 import Geography
from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin, utcnow
from app.models.enums import (
    BarrierSeverity,
    BarrierStatus,
    BarrierType,
    VerificationAction,
)

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.place import Place
    from app.models.report import Report


# ---------------------------------------------------------------------------
# Barrier
# ---------------------------------------------------------------------------


class Barrier(UUIDMixin, TimestampMixin, Base):
    """
    Temporary or persistent accessibility obstacle.

    Lifecycle: SUBMITTED → PENDING_REVIEW → VERIFIED → ACTIVE → RESOLVED
    Alternate:  PENDING_REVIEW → REJECTED
                VERIFIED → DISPUTED
    """

    __tablename__ = "barriers"

    place_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="SET NULL"), nullable=True
    )
    reported_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    # optional link to the parent report
    report_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="SET NULL"),
        nullable=True,
    )
    barrier_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=BarrierType.OTHER.value
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(
        String(20), nullable=False, default=BarrierSeverity.MEDIUM.value
    )
    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default=BarrierStatus.SUBMITTED.value
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # relationships
    place: Mapped[Optional["Place"]] = relationship("Place", back_populates="barriers")
    reporter: Mapped["User"] = relationship(
        "User",
        back_populates="barriers_reported",
        foreign_keys=[reported_by],
    )
    report: Mapped[Optional["Report"]] = relationship(
        "Report",
        back_populates="barrier",
        foreign_keys=[report_id],
    )
    evidence: Mapped[list["Evidence"]] = relationship(
        "Evidence",
        back_populates="barrier",
        cascade="all, delete-orphan",
        foreign_keys="Evidence.barrier_id",
    )
    verifications: Mapped[list["Verification"]] = relationship(
        "Verification",
        back_populates="barrier",
        cascade="all, delete-orphan",
        foreign_keys="Verification.barrier_id",
    )

    __table_args__ = (
        Index("idx_barriers_location", "location", postgresql_using="gist"),
        Index("idx_barriers_status", "status"),
        Index("idx_barriers_expires", "expires_at"),
        Index("idx_barriers_place", "place_id"),
        Index("idx_barriers_reported_by", "reported_by"),
    )


# ---------------------------------------------------------------------------
# Evidence
# ---------------------------------------------------------------------------


class Evidence(UUIDMixin, Base):
    """
    Evidence metadata for a report or barrier.
    Files live in object storage; the DB stores metadata only.
    Never store file contents directly — only the storage key and hash.
    """

    __tablename__ = "evidence"

    report_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=True,
    )
    barrier_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("barriers.id", ondelete="CASCADE"),
        nullable=True,
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    storage_key: Mapped[str] = mapped_column(Text, nullable=False)
    original_filename: Mapped[str] = mapped_column(Text, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    ai_analysis: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    ai_confidence: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 4), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    # relationships
    report: Mapped[Optional["Report"]] = relationship(
        "Report",
        back_populates="evidence",
        foreign_keys=[report_id],
    )
    barrier: Mapped[Optional["Barrier"]] = relationship(
        "Barrier",
        back_populates="evidence",
        foreign_keys=[barrier_id],
    )
    uploader: Mapped["User"] = relationship("User", back_populates="evidence_uploaded")
    observations: Mapped[list["EvidenceObservation"]] = relationship(
        "EvidenceObservation",
        back_populates="evidence",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("idx_evidence_report", "report_id"),
        Index("idx_evidence_barrier", "barrier_id"),
        Index("idx_evidence_uploader", "uploaded_by"),
    )


# ---------------------------------------------------------------------------
# EvidenceObservation
# ---------------------------------------------------------------------------


class EvidenceObservation(UUIDMixin, Base):
    """
    AI analysis of a piece of evidence.
    NOT verification — AI observation ≠ verified fact.
    """

    __tablename__ = "evidence_observations"

    evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evidence.id", ondelete="CASCADE"),
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    observation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    observation: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    # relationships
    evidence: Mapped["Evidence"] = relationship(
        "Evidence", back_populates="observations"
    )

    __table_args__ = (Index("idx_evidence_obs_evidence", "evidence_id"),)


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------


class Verification(UUIDMixin, Base):
    """
    Human or authorised-source verification record.
    Auditability is mandatory — this record is never deleted.
    """

    __tablename__ = "verifications"

    report_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=True,
    )
    barrier_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("barriers.id", ondelete="CASCADE"),
        nullable=True,
    )
    verified_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    action: Mapped[str] = mapped_column(
        String(20), nullable=False, default=VerificationAction.VERIFY.value
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    previous_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    new_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    # relationships
    report: Mapped[Optional["Report"]] = relationship(
        "Report",
        back_populates="verifications",
        foreign_keys=[report_id],
    )
    barrier: Mapped[Optional["Barrier"]] = relationship(
        "Barrier",
        back_populates="verifications",
        foreign_keys=[barrier_id],
    )
    verifier: Mapped["User"] = relationship(
        "User", back_populates="verifications_performed"
    )

    __table_args__ = (
        Index("idx_verifications_report", "report_id"),
        Index("idx_verifications_barrier", "barrier_id"),
        Index("idx_verifications_verifier", "verified_by"),
    )
