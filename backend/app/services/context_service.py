from typing import Optional
from uuid import UUID
from datetime import datetime, timezone

from app.models.weather import WeatherSnapshot
from app.models.crowd import CrowdObservation
from app.repositories.context import ContextRepository


class ContextService:
    """
    Manages and retrieves contextual data (weather snapshots and crowd observations).
    Verifies freshness based on configurable age limits and expiry fields.
    """

    def __init__(self, context_repo: ContextRepository):
        self.context_repo = context_repo

    async def get_latest_weather(
        self,
        lat: float,
        lng: float,
        radius_meters: float = 10000,
        max_age_minutes: int = 120
    ) -> Optional[WeatherSnapshot]:
        """
        Retrieves the latest unexpired weather snapshot within range.
        Ensures freshness against the max age threshold.
        """
        snapshot = await self.context_repo.get_latest_weather(lat, lng, radius_meters)
        if not snapshot:
            return None

        # Check freshness
        now = datetime.now(timezone.utc)
        
        # Ensure timezone awareness
        observed_at = snapshot.observed_at
        if observed_at.tzinfo is None:
            observed_at = observed_at.replace(tzinfo=timezone.utc)
            
        age_seconds = (now - observed_at).total_seconds()
        if age_seconds > (max_age_minutes * 60):
            return None  # Stale data

        # Check explicit expiration if set
        if snapshot.expires_at:
            expires_at = snapshot.expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < now:
                return None

        return snapshot

    async def create_weather_snapshot(self, weather_data: dict) -> WeatherSnapshot:
        return await self.context_repo.create_weather_snapshot(weather_data)

    async def get_latest_crowd_observation(
        self,
        place_id: UUID,
        max_age_minutes: int = 60
    ) -> Optional[CrowdObservation]:
        """
        Retrieves the latest unexpired crowd level observation for a place.
        """
        obs = await self.context_repo.get_latest_crowd_observation(place_id)
        if not obs:
            return None

        # Check freshness
        now = datetime.now(timezone.utc)
        observed_at = obs.observed_at
        if observed_at.tzinfo is None:
            observed_at = observed_at.replace(tzinfo=timezone.utc)

        age_seconds = (now - observed_at).total_seconds()
        if age_seconds > (max_age_minutes * 60):
            return None  # Stale data

        # Check explicit expiration if set
        if obs.expires_at:
            expires_at = obs.expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < now:
                return None

        return obs

    async def create_crowd_observation(self, place_id: UUID, crowd_data: dict) -> CrowdObservation:
        return await self.context_repo.create_crowd_observation(place_id, crowd_data)
