from typing import Optional
from uuid import UUID
from datetime import datetime, timezone

from app.models.weather import WeatherSnapshot
from app.models.crowd import CrowdObservation
from app.repositories.context import ContextRepository
from app.core.config import settings



class ContextService:
    """
    Manages and retrieves contextual data (weather snapshots and crowd observations).
    Verifies freshness based on configurable age limits and expiry fields.
    """

    def __init__(self, context_repo: ContextRepository):
        self.context_repo = context_repo

    async def fetch_live_weather_api(self, lat: float, lng: float) -> Optional[dict]:
        """Fetch live weather from OpenWeatherMap or Open-Meteo (free open weather API)."""
        import urllib.request
        import json
        import asyncio
        from datetime import timedelta

        # 1. Try OpenWeatherMap if key configured
        if settings.weather_api_key:
            try:
                url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={settings.weather_api_key}&units=metric"
                def _call_owm():
                    req = urllib.request.Request(url, headers={"User-Agent": "YatraSaathi/1.0"})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        return json.loads(resp.read().decode())
                
                data = await asyncio.to_thread(_call_owm)
                main = data.get("main", {})
                weather_arr = data.get("weather", [{}])
                wind = data.get("wind", {})
                
                return {
                    "location": {"lat": lat, "lng": lng},
                    "condition": weather_arr[0].get("main", "Clear").upper(),
                    "temperature_c": float(main.get("temp", 25.0)),
                    "humidity_percent": float(main.get("humidity", 50.0)),
                    "wind_speed_kmh": float(wind.get("speed", 10.0) * 3.6),
                    "observed_at": datetime.now(timezone.utc),
                    "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)
                }
            except Exception:
                pass

        # 2. Fallback to free Open-Meteo API (No key required)
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true"
            def _call_openmeteo():
                req = urllib.request.Request(url, headers={"User-Agent": "YatraSaathi/1.0"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    return json.loads(resp.read().decode())

            data = await asyncio.to_thread(_call_openmeteo)
            cw = data.get("current_weather", {})
            wcode = cw.get("weathercode", 0)
            
            # Map weather code to condition
            condition = "CLEAR"
            if wcode in (1, 2, 3):
                condition = "CLOUDY"
            elif wcode in (45, 48):
                condition = "FOG"
            elif wcode in (51, 53, 55, 61, 63, 65, 80, 81, 82):
                condition = "RAIN"
            elif wcode in (95, 96, 99):
                condition = "STORM"

            return {
                "location": {"lat": lat, "lng": lng},
                "condition": condition,
                "temperature_c": float(cw.get("temperature", 28.0)),
                "humidity_percent": 55.0,
                "wind_speed_kmh": float(cw.get("windspeed", 12.0)),
                "observed_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)
            }
        except Exception:
            return None

    async def get_latest_weather(
        self,
        lat: float,
        lng: float,
        radius_meters: float = 10000,
        max_age_minutes: int = 120
    ) -> Optional[WeatherSnapshot]:
        """
        Retrieves the latest unexpired weather snapshot within range.
        If missing or stale, attempts live fetch from weather API.
        """
        snapshot = await self.context_repo.get_latest_weather(lat, lng, radius_meters)
        now = datetime.now(timezone.utc)
        
        if snapshot:
            observed_at = snapshot.observed_at
            if observed_at.tzinfo is None:
                observed_at = observed_at.replace(tzinfo=timezone.utc)
                
            age_seconds = (now - observed_at).total_seconds()
            is_expired = False
            if snapshot.expires_at:
                exp = snapshot.expires_at.replace(tzinfo=timezone.utc) if snapshot.expires_at.tzinfo is None else snapshot.expires_at
                if exp < now:
                    is_expired = True

            if age_seconds <= (max_age_minutes * 60) and not is_expired:
                return snapshot

        # Try live weather fetch
        live_data = await self.fetch_live_weather_api(lat, lng)
        if live_data:
            try:
                new_snapshot = await self.context_repo.create_weather_snapshot(live_data)
                return new_snapshot
            except Exception:
                pass

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
