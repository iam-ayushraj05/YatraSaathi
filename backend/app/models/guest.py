"""
yatrasaathi — Guest session and voice usage tracking models.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class GuestSession(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "guest_sessions"

    session_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    ip_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    voice_chat_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_free_chats: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    temporary_conversation_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    temporary_journey_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    converted_to_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # relationships
    voice_usages: Mapped[list["VoiceUsage"]] = relationship("VoiceUsage", back_populates="guest_session", cascade="all, delete-orphan")


class VoiceUsage(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "voice_usages"

    guest_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("guest_sessions.id", ondelete="SET NULL"), nullable=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    conversation_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    turns_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="COMPLETED")  # STARTED, COMPLETED, INTERRUPTED

    # relationships
    guest_session: Mapped[Optional["GuestSession"]] = relationship("GuestSession", back_populates="voice_usages")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="voice_usages")
