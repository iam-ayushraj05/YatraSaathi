"""
yatrasaathi — Report model.
"""
import uuid
from typing import Optional, TYPE_CHECKING

from geoalchemy2 import Geography
from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import ReportStatus, ReportType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.place import Place
    from app.models.barrier import Barrier, Evidence, Verification


class Report(UUIDMixin, TimestampMixin, Base):
    """Generic user-submitted report."""

    __tablename__ = "reports"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    place_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("places.id", ondelete="SET NULL"), nullable=True
    )
    report_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=ReportType.OTHER.value
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[Optional[object]] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default=ReportStatus.SUBMITTED.value
    )

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="reports")
    place: Mapped[Optional["Place"]] = relationship("Place", back_populates="reports")
    evidence: Mapped[list["Evidence"]] = relationship(
        "Evidence", back_populates="report", cascade="all, delete-orphan",
        foreign_keys="Evidence.report_id",
    )
    verifications: Mapped[list["Verification"]] = relationship(
        "Verification", back_populates="report", cascade="all, delete-orphan",
        foreign_keys="Verification.report_id",
    )
    # a barrier may reference this report (1:1, barrier has FK to report)
    barrier: Mapped[Optional["Barrier"]] = relationship(
        "Barrier", back_populates="report", uselist=False,
        foreign_keys="Barrier.report_id",
    )

    __table_args__ = (
        Index("idx_reports_user", "user_id"),
        Index("idx_reports_place", "place_id"),
        Index("idx_reports_status", "status"),
        Index("idx_reports_type", "report_type"),
        Index("idx_reports_location", "location", postgresql_using="gist"),
    )
