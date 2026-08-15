"""
YatraSaathi — Common schemas used across multiple domains.
"""
from pydantic import BaseModel, Field


class Coordinate(BaseModel):
    """Geospatial coordinate representing latitude and longitude."""
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    lng: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
