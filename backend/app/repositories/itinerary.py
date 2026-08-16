from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.models.itinerary import Itinerary, ItineraryStop
from app.repositories.base import BaseRepository


class ItineraryRepository(BaseRepository):
    """Repository handling database operations for Itineraries and Stops."""

    async def get_itinerary(self, itinerary_id: UUID) -> Optional[Itinerary]:
        stmt = (
            select(Itinerary)
            .where(Itinerary.id == itinerary_id)
            .options(
                selectinload(Itinerary.stops).selectinload(ItineraryStop.place)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_itinerary(
        self,
        user_id: UUID,
        title: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        status: str = "DRAFT",
        generated_by: str = "USER_CREATED"
    ) -> Itinerary:
        itinerary = Itinerary(
            user_id=user_id,
            title=title,
            start_time=start_time,
            end_time=end_time,
            status=status,
            generated_by=generated_by,
        )
        self.db.add(itinerary)
        await self.db.flush()
        return itinerary

    async def update_itinerary(
        self,
        itinerary_id: UUID,
        update_data: dict
    ) -> Optional[Itinerary]:
        itinerary = await self.get_itinerary(itinerary_id)
        if not itinerary:
            return None

        for key, val in update_data.items():
            if hasattr(itinerary, key) and val is not None:
                setattr(itinerary, key, val)

        await self.db.flush()
        return itinerary

    async def create_itinerary_stop(
        self,
        itinerary_id: UUID,
        place_id: UUID,
        sequence: int,
        planned_start: Optional[datetime] = None,
        planned_end: Optional[datetime] = None,
        notes: Optional[str] = None,
        accessibility_snapshot: Optional[dict] = None
    ) -> ItineraryStop:
        stop = ItineraryStop(
            itinerary_id=itinerary_id,
            place_id=place_id,
            sequence=sequence,
            planned_start=planned_start,
            planned_end=planned_end,
            notes=notes,
            accessibility_snapshot=accessibility_snapshot or {},
        )
        self.db.add(stop)
        await self.db.flush()
        return stop

    async def clear_stops(self, itinerary_id: UUID) -> None:
        """Delete all stops for a given itinerary to allow fresh sequence rewriting."""
        stmt = delete(ItineraryStop).where(ItineraryStop.itinerary_id == itinerary_id)
        await self.db.execute(stmt)
        await self.db.flush()
