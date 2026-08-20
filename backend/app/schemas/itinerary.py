"""
yatrasaathi — Itinerary and ItineraryStop schemas.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.models.enums import ItineraryStatus, ItinerarySource
from app.schemas.place import PlaceResponse


# ---------------------------------------------------------------------------
# ItineraryStop
# ---------------------------------------------------------------------------

class ItineraryStopBase(BaseModel):
    sequence: int
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    notes: Optional[str] = None
    accessibility_snapshot: Optional[dict] = Field(default_factory=dict)


class ItineraryStopCreate(BaseModel):
    place_id: UUID
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    notes: Optional[str] = None
    # sequence can be passed or inferred
    sequence: Optional[int] = 0


class ItineraryStopUpdate(BaseModel):
    place_id: Optional[UUID] = None
    sequence: Optional[int] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    notes: Optional[str] = None


class ItineraryStopResponse(ItineraryStopBase):
    id: UUID
    itinerary_id: UUID
    place_id: UUID
    place: Optional[PlaceResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Itinerary
# ---------------------------------------------------------------------------

class ItineraryBase(BaseModel):
    title: str = Field(..., max_length=255)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: ItineraryStatus = ItineraryStatus.DRAFT


class ItineraryCreate(BaseModel):
    title: str = Field(..., max_length=255)
    stops: list[ItineraryStopCreate] = Field(default_factory=list)
    source: ItinerarySource = ItinerarySource.USER_CREATED


class ItineraryUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[ItineraryStatus] = None
    stops: Optional[list[ItineraryStopCreate]] = None


class ItineraryResponse(ItineraryBase):
    id: UUID
    user_id: UUID
    generated_by: ItinerarySource
    created_at: datetime
    updated_at: datetime
    stops: list[ItineraryStopResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
