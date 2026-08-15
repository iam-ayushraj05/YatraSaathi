"""
YatraSaathi — WeatherSnapshot model.
"""
import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal

from geoalchemy2 import Geography
from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin, utcnow


class WeatherSnapshot(UUIDMixin, Base):
    """
    Point-in-time weather observation for a location.
    Always includes provider and timestamp for trust/freshness tracking.
    """

    __tablename__ = "weather_snapshots"

    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="demo")
    condition: Mapped[str] = mapped_column(String(100), nullable=False)
    temperature_c: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    rain_probability: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 4), nullable=True
    )
    wind_speed_kph: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(6, 2), nullable=True
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    raw_metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    __table_args__ = (
        Index("idx_weather_location", "location", postgresql_using="gist"),
        Index("idx_weather_observed_at", "observed_at"),
        Index("idx_weather_expires", "expires_at"),
    )
