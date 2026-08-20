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

    def __init__(self, context_repo: Optional[ContextRepository] = None):
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
                    req = urllib.request.Request(url, headers={"User-Agent": "yatrasaathi/1.0"})
                    with urllib.request.urlopen(req, timeout=5) as resp:
                        return json.loads(resp.read().decode())
                
                data = await asyncio.to_thread(_call_owm)
                main = data.get("main", {})
                weather_arr = data.get("weather", [{}])
                wind = data.get("wind", {})
                rain = data.get("rain", {})
                
                temp = float(main.get("temp", 25.0))
                feels_like = float(main.get("feels_like", temp))
                humidity = float(main.get("humidity", 50.0))
                wind_kph = float(wind.get("speed", 3.0) * 3.6)
                pop = float(data.get("pop", 0.0))
                rain_1h = float(rain.get("1h", 0.0))
                city_name = data.get("name", "")

                return {
                    "location": {"lat": lat, "lng": lng},
                    "provider": "openweathermap",
                    "condition": weather_arr[0].get("main", "Clear").upper(),
                    "temperature_c": temp,
                    "rain_probability": pop if pop > 0 else (0.8 if rain_1h > 0 else 0.0),
                    "wind_speed_kph": wind_kph,
                    "observed_at": datetime.now(timezone.utc),
                    "expires_at": datetime.now(timezone.utc) + timedelta(minutes=30),
                    "raw_metadata": {
                        "feels_like_c": feels_like,
                        "humidity_percent": humidity,
                        "precipitation_mm": rain_1h,
                        "city_name": city_name,
                        "weather_icon": weather_arr[0].get("icon", ""),
                        "description": weather_arr[0].get("description", "Clear")
                    }
                }
            except Exception:
                pass

        # 2. Fallback to free Open-Meteo API (No key required)
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m"
            def _call_openmeteo():
                req = urllib.request.Request(url, headers={"User-Agent": "yatrasaathi/1.0"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    return json.loads(resp.read().decode())

            data = await asyncio.to_thread(_call_openmeteo)
            current = data.get("current", {}) or data.get("current_weather", {})
            wcode = current.get("weather_code", current.get("weathercode", 0))
            temp = float(current.get("temperature_2m", current.get("temperature", 25.0)))
            feels_like = float(current.get("apparent_temperature", temp))
            humidity = float(current.get("relative_humidity_2m", 50.0))
            wind_kph = float(current.get("wind_speed_10m", current.get("windspeed", 10.0)))
            precip = float(current.get("precipitation", 0.0))

            # Map weather code to condition string
            condition = "CLEAR"
            desc = "Clear sky"
            if wcode in (1, 2, 3):
                condition = "CLOUDY"
                desc = "Partly cloudy"
            elif wcode in (45, 48):
                condition = "FOG"
                desc = "Foggy"
            elif wcode in (51, 53, 55, 61, 63, 65, 80, 81, 82):
                condition = "RAIN"
                desc = "Rainy"
            elif wcode in (71, 73, 75, 77, 85, 86):
                condition = "SNOW"
                desc = "Snowy"
            elif wcode in (95, 96, 99):
                condition = "STORM"
                desc = "Thunderstorm"

            return {
                "location": {"lat": lat, "lng": lng},
                "provider": "open-meteo",
                "condition": condition,
                "temperature_c": temp,
                "rain_probability": 0.8 if precip > 0 or condition == "RAIN" else 0.0,
                "wind_speed_kph": wind_kph,
                "observed_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=30),
                "raw_metadata": {
                    "feels_like_c": feels_like,
                    "humidity_percent": humidity,
                    "precipitation_mm": precip,
                    "weather_code": wcode,
                    "description": desc
                }
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
        snapshot = None
        if self.context_repo:
            try:
                snapshot = await self.context_repo.get_latest_weather(lat, lng, radius_meters)
            except Exception:
                snapshot = None

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
            if self.context_repo:
                try:
                    new_snapshot = await self.context_repo.create_weather_snapshot(live_data)
                    return new_snapshot
                except Exception:
                    pass

            # Fallback in-memory object if DB save is unavailable
            import uuid
            from geoalchemy2.elements import WKTElement
            return WeatherSnapshot(
                id=uuid.uuid4(),
                provider=live_data.get("provider", "open-meteo"),
                condition=live_data.get("condition", "CLEAR"),
                temperature_c=live_data.get("temperature_c", 25.0),
                rain_probability=live_data.get("rain_probability", 0.0),
                wind_speed_kph=live_data.get("wind_speed_kph", 10.0),
                location=WKTElement(f"POINT({lng} {lat})", srid=4326),
                observed_at=live_data.get("observed_at", now),
                expires_at=live_data.get("expires_at"),
                raw_metadata=live_data.get("raw_metadata", {}),
                created_at=now
            )

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
