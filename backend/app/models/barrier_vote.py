"""
yatrasaathi — BarrierVote ORM model.
Tracks community proximity verification votes (confirm / reject) for barrier presence.
"""
import uuid
from typing import Optional
from datetime import datetime

from sqlalchemy import Boolean, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, utcnow


class BarrierVote(UUIDMixin, Base):
    """
    Community proximity verification vote for barrier presence/clearance.
    """

    __tablename__ = "barrier_votes"

    barrier_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("barriers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    user_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    user_lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow
    )
