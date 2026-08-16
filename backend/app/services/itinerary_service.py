from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.itinerary import Itinerary, ItineraryStop
from app.repositories.itinerary import ItineraryRepository
from app.repositories.place import PlaceRepository
from app.services.exceptions import NotFoundException, ValidationError
from app.services.accessibility_service import AccessibilityService


class ItineraryService:
    """
    Manages itinerary business logic: creation, stops manipulation, sequence re-ordering,
    and accessibility-aware validation of stops.
    """

    def __init__(
        self,
        itinerary_repo: ItineraryRepository,
        place_repo: PlaceRepository,
        accessibility_service: AccessibilityService
    ):
        self.itinerary_repo = itinerary_repo
        self.place_repo = place_repo
        self.accessibility_service = accessibility_service

    async def create_itinerary(
        self,
        user_id: UUID,
        title: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Itinerary:
        if not title.strip():
            raise ValidationError("Itinerary title cannot be empty.")
        return await self.itinerary_repo.create_itinerary(
            user_id=user_id,
            title=title,
            start_time=start_time,
            end_time=end_time
        )

    async def get_itinerary(self, itinerary_id: UUID) -> Itinerary:
        itinerary = await self.itinerary_repo.get_itinerary(itinerary_id)
        if not itinerary:
            raise NotFoundException("Itinerary not found.")
        return itinerary

    async def add_stop(
        self,
        itinerary_id: UUID,
        place_id: UUID,
        sequence: int,
        planned_start: Optional[datetime] = None,
        planned_end: Optional[datetime] = None,
        notes: Optional[str] = None,
        profile = None
    ) -> ItineraryStop:
        """
        Adds a stop to the itinerary. If a traveller profile is supplied,
        evaluates place accessibility and embeds an accessibility snapshot.
        """
        itinerary = await self.get_itinerary(itinerary_id)
        place = await self.place_repo.get_by_id(place_id)
        if not place:
            raise NotFoundException("Place not found.")

        # Optional accessibility pre-check
        snapshot = {}
        if profile:
            eval_res = await self.accessibility_service.evaluate_place(place, profile)
            snapshot = {
                "score": eval_res["score"],
                "level": eval_res["level"],
                "warnings": eval_res["warnings"]
            }

        return await self.itinerary_repo.create_itinerary_stop(
            itinerary_id=itinerary_id,
            place_id=place_id,
            sequence=sequence,
            planned_start=planned_start,
            planned_end=planned_end,
            notes=notes,
            accessibility_snapshot=snapshot
        )

    async def reorder_stops(self, itinerary_id: UUID, place_ids: list[UUID]) -> Itinerary:
        """Clears all existing stops and replaces them in the new sequence order."""
        itinerary = await self.get_itinerary(itinerary_id)
        
        # Verify all places exist
        stops_to_create = []
        for idx, place_id in enumerate(place_ids):
            place = await self.place_repo.get_by_id(place_id)
            if not place:
                raise NotFoundException(f"Place with ID {place_id} not found.")
            stops_to_create.append(place_id)

        # Clear and rewrite
        await self.itinerary_repo.clear_stops(itinerary_id)
        for idx, place_id in enumerate(stops_to_create):
            await self.itinerary_repo.create_itinerary_stop(
                itinerary_id=itinerary_id,
                place_id=place_id,
                sequence=idx + 1
            )

        # Reload itinerary
        return await self.get_itinerary(itinerary_id)

    async def check_itinerary_suitability(self, itinerary_id: UUID, profile) -> dict:
        """
        Evaluates the accessibility compatibility of the entire itinerary.
        Flag any stops that violate the user's accessibility profile.
        """
        itinerary = await self.get_itinerary(itinerary_id)
        
        overall_score = 100
        stop_evaluations = []
        warnings = []

        for stop in itinerary.stops:
            eval_res = await self.accessibility_service.evaluate_place(stop.place, profile)
            
            # Lower overall itinerary score if any stop is poorly accessible
            stop_score = eval_res["score"]
            if stop_score < overall_score:
                overall_score = stop_score

            stop_evaluations.append({
                "place_name": stop.place.name,
                "place_id": stop.place_id,
                "score": stop_score,
                "level": eval_res["level"],
                "warnings": eval_res["warnings"]
            })

            if eval_res["level"] in ("LOW", "UNKNOWN"):
                warnings.append(f"Stop '{stop.place.name}' has low or unknown accessibility suitability ({eval_res['level']}).")

        return {
            "itinerary_title": itinerary.title,
            "overall_suitability": "HIGH" if overall_score >= 80 else "MEDIUM" if overall_score >= 50 else "LOW",
            "overall_score": overall_score,
            "stops": stop_evaluations,
            "warnings": warnings
        }
