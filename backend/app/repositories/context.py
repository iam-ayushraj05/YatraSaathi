from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, func
from geoalchemy2.functions import ST_DWithin

from app.models.weather import WeatherSnapshot
from app.models.crowd import CrowdObservation
from app.repositories.base import BaseRepository


class ContextRepository(BaseRepository):
    """Repository handling database operations for Weather and Crowd/Context."""

    # -----------------------------------------------------------------------
    # WeatherSnapshot
    # -----------------------------------------------------------------------

    async def create_weather_snapshot(self, weather_data: dict) -> WeatherSnapshot:
        lon = weather_data["location"]["lng"]
        lat = weather_data["location"]["lat"]
        location_wkt = f"SRID=4326;POINT({lon} {lat})"

        snapshot = WeatherSnapshot(
            location=func.ST_GeogFromText(location_wkt),
            provider=weather_data.get("provider", "demo"),
            condition=weather_data["condition"],
            temperature_c=weather_data["temperature_c"],
            rain_probability=weather_data.get("rain_probability"),
            wind_speed_kph=weather_data.get("wind_speed_kph"),
            observed_at=weather_data.get("observed_at", datetime.now(timezone.utc)),
            expires_at=weather_data.get("expires_at"),
            raw_metadata=weather_data.get("raw_metadata", {}),
        )
        self.db.add(snapshot)
        await self.db.flush()
        return snapshot

    async def get_latest_weather(self, lat: float, lng: float, radius_meters: float = 10000) -> Optional[WeatherSnapshot]:
        """Get latest unexpired weather snapshot within range using PostGIS."""
        center_geog = func.ST_GeogFromText(f"SRID=4326;POINT({lng} {lat})")
        now = datetime.now(timezone.utc)
        
        stmt = (
            select(WeatherSnapshot)
            .where(
                func.ST_DWithin(WeatherSnapshot.location, center_geog, radius_meters),
                (WeatherSnapshot.expires_at == None) | (WeatherSnapshot.expires_at > now)
            )
            .order_by(WeatherSnapshot.observed_at.desc())
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    # -----------------------------------------------------------------------
    # CrowdObservation
    # -----------------------------------------------------------------------

    async def create_crowd_observation(self, place_id: UUID, crowd_data: dict) -> CrowdObservation:
        observation = CrowdObservation(
            place_id=place_id,
            crowd_level=crowd_data.get("crowd_level", "UNKNOWN"),
            source_type=crowd_data.get("source_type", "DEMO"),
            confidence=crowd_data.get("confidence", "UNKNOWN"),
            observed_at=crowd_data.get("observed_at", datetime.now(timezone.utc)),
            expires_at=crowd_data.get("expires_at"),
            extra_data=crowd_data.get("extra_data", {}),
        )
        self.db.add(observation)
        await self.db.flush()
        return observation

    async def get_latest_crowd_observation(self, place_id: UUID) -> Optional[CrowdObservation]:
        """Get latest unexpired crowd level observation for a place."""
        now = datetime.now(timezone.utc)
        stmt = (
            select(CrowdObservation)
            .where(
                CrowdObservation.place_id == place_id,
                (CrowdObservation.expires_at == None) | (CrowdObservation.expires_at > now)
            )
            .order_by(CrowdObservation.observed_at.desc())
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
