from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, func

from app.models.route import RouteRequest, Route, RouteSegment
from app.repositories.route import RouteRepository
from app.repositories.barrier import BarrierRepository
from app.services.exceptions import NotFoundException, ValidationError, RoutingException
from app.services.scoring_service import ScoringService
from app.services.context_service import ContextService
from app.schemas.place import parse_postgis_location
from app.schemas.route import parse_postgis_linestring


def interpolate_points(origin: dict, destination: dict, num_points: int, offset_x: float = 0.0, offset_y: float = 0.0) -> list[dict]:
    """Generates a dynamic list of coordinates between origin and destination with optional mid-route offsets."""
    coords = []
    for i in range(num_points):
        t = i / (num_points - 1)
        lat = origin["lat"] + (destination["lat"] - origin["lat"]) * t
        lng = origin["lng"] + (destination["lng"] - origin["lng"]) * t
        if 0 < i < num_points - 1:
            factor = 1.0 - abs(2 * t - 1)  # peaks in the middle
            lat += offset_y * factor
            lng += offset_x * factor
        coords.append({"lng": lng, "lat": lat})
    return coords


class RoutingProvider:
    """Interface for routing engines."""
    async def get_candidate_routes(self, origin: dict, destination: dict) -> list[dict]:
        raise NotImplementedError


class DemoRoutingProvider(RoutingProvider):
    """
    Simulates three distinct path alternatives between origin and destination.
    Adjusts midpoints dynamically to support barrier intersection tests.
    """
    async def get_candidate_routes(self, origin: dict, destination: dict) -> list[dict]:
        # Route A: Direct but has stairs
        coords_a = interpolate_points(origin, destination, 5, offset_x=0.0, offset_y=0.0)
        route_a = {
            "name": "Direct Route A",
            "provider": "demo",
            "provider_route_id": "route-a-direct",
            "distance_meters": 1200.0,
            "duration_seconds": 720.0,
            "stairs_count": 15,
            "coords": coords_a,
            "segments": [
                {"sequence": 0, "distance_meters": 600.0, "duration_seconds": 360.0, "surface_type": "ASPHALT", "stairs_count": 0},
                {"sequence": 1, "distance_meters": 600.0, "duration_seconds": 360.0, "surface_type": "CONCRETE", "stairs_count": 15}
            ]
        }

        # Route B: Slightly longer but step-free and paved (suitable for wheelchair)
        # Offset to the East to bypass Route A's location
        coords_b = interpolate_points(origin, destination, 5, offset_x=0.0015, offset_y=0.001)
        route_b = {
            "name": "Accessible Bypass B",
            "provider": "demo",
            "provider_route_id": "route-b-accessible",
            "distance_meters": 1450.0,
            "duration_seconds": 870.0,
            "stairs_count": 0,
            "coords": coords_b,
            "segments": [
                {"sequence": 0, "distance_meters": 700.0, "duration_seconds": 420.0, "surface_type": "ASPHALT", "stairs_count": 0},
                {"sequence": 1, "distance_meters": 750.0, "duration_seconds": 450.0, "surface_type": "PAVED", "stairs_count": 0}
            ]
        }

        # Route C: Longest, unpaved/cobblestone path
        # Offset to the West
        coords_c = interpolate_points(origin, destination, 5, offset_x=-0.002, offset_y=-0.0015)
        route_c = {
            "name": "Scenic Pathway C",
            "provider": "demo",
            "provider_route_id": "route-c-rough",
            "distance_meters": 1800.0,
            "duration_seconds": 1100.0,
            "stairs_count": 2,
            "coords": coords_c,
            "segments": [
                {"sequence": 0, "distance_meters": 900.0, "duration_seconds": 550.0, "surface_type": "GRAVEL", "stairs_count": 0},
                {"sequence": 1, "distance_meters": 900.0, "duration_seconds": 550.0, "surface_type": "COBBLESTONE", "stairs_count": 2}
            ]
        }

        return [route_a, route_b, route_c]


class RouteService:
    """
    Manages routing flow: gets alternatives, runs PostGIS barrier intersection,
    incorporates weather/crowd context, scores, ranks, and handles recalculations.
    """

    def __init__(
        self,
        route_repo: RouteRepository,
        barrier_repo: BarrierRepository,
        scoring_service: ScoringService,
        context_service: ContextService,
        routing_provider: Optional[RoutingProvider] = None
    ):
        self.route_repo = route_repo
        self.barrier_repo = barrier_repo
        self.scoring_service = scoring_service
        self.context_service = context_service
        self.routing_provider = routing_provider or DemoRoutingProvider()

    async def plan_route(
        self,
        user_id: Optional[UUID],
        profile,
        origin: dict,
        destination: dict,
        preferences: Optional[dict] = None
    ) -> dict:
        """Plans, scores, and ranks candidate routes based on user needs."""
        # 1. Create RouteRequest
        profile_id = getattr(profile, "id", None)
        request = await self.route_repo.create_route_request(
            user_id=user_id,
            profile_id=profile_id,
            origin_coord=origin,
            destination_coord=destination,
            preferences=preferences
        )

        # 2. Get Weather & Crowd context
        weather = await self.context_service.get_latest_weather(origin["lat"], origin["lng"])
        
        # 3. Get candidate routes from provider
        candidates = await self.routing_provider.get_candidate_routes(origin, destination)

        scored_alternatives = []
        for candidate in candidates:
            # Construct WKT LineString for PostGIS query
            from app.repositories.route import coords_to_wkt_linestring
            wkt = coords_to_wkt_linestring(candidate["coords"])
            
            # Find active barriers near the route geometry
            barriers = await self.barrier_repo.get_barriers_near_geometry(wkt, buffer_meters=15.0)

            # Evaluate score
            score_data = self.scoring_service.evaluate_route(
                route=type("RouteMock", (object,), {
                    "stairs_count": candidate["stairs_count"],
                    "distance_meters": candidate["distance_meters"],
                    "segments": [type("SegMock", (object,), s) for s in candidate["segments"]]
                }),
                profile=profile,
                barriers_on_route=barriers,
                weather=weather
            )

            # Create Route database record
            route_data = {
                "provider": candidate["provider"],
                "provider_route_id": candidate["provider_route_id"],
                "distance_meters": candidate["distance_meters"],
                "duration_seconds": candidate["duration_seconds"],
                "accessibility_score": score_data["score"],
                "stairs_count": candidate["stairs_count"],
                "barrier_count": len(barriers),
                "confidence": "HIGH" if len(barriers) == 0 else "MEDIUM",
                "ranking_reason": {"reasons": score_data["reasons"], "warnings": score_data["warnings"]}
            }
            route_record = await self.route_repo.create_route(request.id, route_data, candidate["coords"])

            # Create RouteSegments
            for seg in candidate["segments"]:
                # Construct sub-segment coordinates dynamically (split route coords or mock)
                seg_coords = candidate["coords"][:3] if seg["sequence"] == 0 else candidate["coords"][2:]
                segment_data = {
                    "sequence": seg["sequence"],
                    "distance_meters": seg["distance_meters"],
                    "duration_seconds": seg["duration_seconds"],
                    "surface_type": seg["surface_type"],
                    "stairs_count": seg["stairs_count"],
                    "accessibility_status": "AVAILABLE" if seg["stairs_count"] == 0 else "UNAVAILABLE",
                    "barrier_count": 0
                }
                await self.route_repo.create_route_segment(route_record.id, segment_data, seg_coords)

            scored_alternatives.append({
                "id": route_record.id,
                "name": candidate["name"],
                "score": score_data["score"],
                "level": score_data["level"],
                "reasons": score_data["reasons"],
                "warnings": score_data["warnings"],
                "distance_meters": candidate["distance_meters"],
                "duration_seconds": candidate["duration_seconds"],
                "route_record": route_record
            })

        # Sort alternatives by score (descending), then duration (ascending)
        scored_alternatives.sort(key=lambda x: (-x["score"], x["duration_seconds"]))

        return {
            "request_id": request.id,
            "recommendation": scored_alternatives[0] if scored_alternatives else None,
            "alternatives": scored_alternatives
        }

    async def recalculate_route(
        self,
        previous_route_id: UUID,
        user_id: Optional[UUID],
        profile
    ) -> dict:
        """
        Detects if the previous route is now affected by newly appeared active barriers.
        If affected, re-evaluates alternatives and returns the new recommended route.
        """
        previous_route = await self.route_repo.get_route(previous_route_id)
        if not previous_route:
            raise NotFoundException("Previous route not found.")

        # Get parent request to extract origin/destination
        request = await self.route_repo.get_route_request(previous_route.route_request_id)
        if not request:
            raise NotFoundException("Parent route request not found.")

        # Parse origin/destination from PostGIS Geography
        origin_loc = parse_postgis_location(request.origin)
        dest_loc = parse_postgis_location(request.destination)
        if not origin_loc or not dest_loc:
            raise ValidationError("Invalid coordinates in parent request.")

        # 1. Check if previous route is currently affected by active barriers
        # Extract coordinates of previous route
        prev_coords = parse_postgis_linestring(previous_route.geometry)
        from app.repositories.route import coords_to_wkt_linestring
        prev_wkt = coords_to_wkt_linestring(prev_coords)

        active_barriers = await self.barrier_repo.get_barriers_near_geometry(prev_wkt, buffer_meters=15.0)

        # Re-plan routes with the latest barriers and context
        new_plan = await self.plan_route(
            user_id=user_id,
            profile=profile,
            origin={"lat": origin_loc.lat, "lng": origin_loc.lng},
            destination={"lat": dest_loc.lat, "lng": dest_loc.lng},
            preferences=request.preferences
        )

        new_rec = new_plan["recommendation"]
        
        return {
            "previous_route_id": previous_route_id,
            "previous_route_affected": len(active_barriers) > 0,
            "affected_barriers": active_barriers,
            "new_recommendation": new_rec,
            "all_alternatives": new_plan["alternatives"],
            "reason": f"Recalculated due to {len(active_barriers)} active barrier(s) detected near previous route." if active_barriers else "Recalculated; previous route is clear."
        }
