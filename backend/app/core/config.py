from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────
    database_url: str

    # ── App ───────────────────────────────────────────────────────────────
    app_name: str = "YatraSaathi API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True

    # ── CORS ──────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # ── AI / LLM ──────────────────────────────────────────────────────────
    llm_provider: str = "demo"          # "gemini" | "openai" | "demo"
    llm_api_key: Optional[str] = None
    llm_model: str = "gemini-2.0-flash"

    # ── Routing provider ─────────────────────────────────────────────────
    routing_provider: str = "demo"      # "osrm" | "google" | "demo"
    routing_api_key: Optional[str] = None
    routing_base_url: Optional[str] = None

    # ── Map ───────────────────────────────────────────────────────────────
    map_provider: str = "leaflet"       # "leaflet" | "mapbox"
    map_api_key: Optional[str] = None

    # ── Weather ───────────────────────────────────────────────────────────
    weather_provider: str = "demo"      # "openweathermap" | "demo"
    weather_api_key: Optional[str] = None

    # ── Voice / LiveKit / STT / TTS ───────────────────────────────────────
    voice_provider: str = "demo"        # "livekit" | "demo"
    livekit_url: Optional[str] = None
    livekit_api_key: Optional[str] = None
    livekit_api_secret: Optional[str] = None
    deepgram_api_key: Optional[str] = None
    murf_api_key: Optional[str] = None

    # ── Demo mode ─────────────────────────────────────────────────────────
    demo_mode: bool = True              # enables demo provider fallbacks

    # ── Trust scoring weights ─────────────────────────────────────────────
    trust_weight_source: float = 0.30
    trust_weight_verification: float = 0.35
    trust_weight_recency: float = 0.20
    trust_weight_evidence: float = 0.15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()