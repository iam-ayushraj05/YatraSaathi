from typing import Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.route import RouteRequest, Route, RouteSegment, RouteConstraint
from app.repositories.base import BaseRepository


def coords_to_wkt_linestring(coords: list) -> str:
    """Convert a list of Coordinate schemas/dicts to WKT LINESTRING format (longitude latitude)."""
    pts = []
    for pt in coords:
        if isinstance(pt, dict):
            pts.append(f"{pt['lng']} {pt['lat']}")
        else:
            # Pydantic schema Coordinate
            pts.append(f"{pt.lng} {pt.lat}")
    return f"LINESTRING({', '.join(pts)})"


class RouteRepository(BaseRepository):
    """Repository handling database operations for Routes, Requests, Segments, and Constraints."""

    # -----------------------------------------------------------------------
    # RouteRequest
    # -----------------------------------------------------------------------

    async def get_route_request(self, request_id: UUID) -> Optional[RouteRequest]:
        stmt = (
            select(RouteRequest)
            .where(RouteRequest.id == request_id)
            .options(
                selectinload(RouteRequest.routes),
                selectinload(RouteRequest.constraints),
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_route_request(
        self,
        user_id: Optional[UUID],
        profile_id: Optional[UUID],
        origin_coord: dict,
        destination_coord: dict,
        preferences: Optional[dict] = None
    ) -> RouteRequest:
        origin_wkt = f"SRID=4326;POINT({origin_coord['lng']} {origin_coord['lat']})"
        destination_wkt = f"SRID=4326;POINT({destination_coord['lng']} {destination_coord['lat']})"

        request = RouteRequest(
            user_id=user_id,
            profile_id=profile_id,
            origin=func.ST_GeogFromText(origin_wkt),
            destination=func.ST_GeogFromText(destination_wkt),
            preferences=preferences or {},
        )
        self.db.add(request)
        await self.db.flush()
        return request

    # -----------------------------------------------------------------------
    # Route
    # -----------------------------------------------------------------------

    async def get_route(self, route_id: UUID) -> Optional[Route]:
        stmt = (
            select(Route)
            .where(Route.id == route_id)
            .options(selectinload(Route.segments))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_route(
        self,
        route_request_id: UUID,
        route_data: dict,
        geometry_coords: list
    ) -> Route:
        wkt = coords_to_wkt_linestring(geometry_coords)
        route = Route(
            route_request_id=route_request_id,
            provider=route_data.get("provider", "demo"),
            provider_route_id=route_data.get("provider_route_id"),
            geometry=func.ST_GeomFromText(wkt, 4326),
            distance_meters=route_data["distance_meters"],
            duration_seconds=route_data["duration_seconds"],
            accessibility_score=route_data.get("accessibility_score"),
            walking_distance_meters=route_data.get("walking_distance_meters"),
            stairs_count=route_data.get("stairs_count"),
            barrier_count=route_data.get("barrier_count", 0),
            confidence=route_data.get("confidence", "UNKNOWN"),
            ranking_reason=route_data.get("ranking_reason", {}),
        )
        self.db.add(route)
        await self.db.flush()
        return route

    # -----------------------------------------------------------------------
    # RouteSegment
    # -----------------------------------------------------------------------

    async def create_route_segment(
        self,
        route_id: UUID,
        segment_data: dict,
        geometry_coords: list
    ) -> RouteSegment:
        wkt = coords_to_wkt_linestring(geometry_coords)
        segment = RouteSegment(
            route_id=route_id,
            sequence=segment_data["sequence"],
            geometry=func.ST_GeomFromText(wkt, 4326),
            distance_meters=segment_data["distance_meters"],
            duration_seconds=segment_data["duration_seconds"],
            surface_type=segment_data.get("surface_type"),
            stairs_count=segment_data.get("stairs_count"),
            accessibility_status=segment_data.get("accessibility_status", "UNKNOWN"),
            barrier_count=segment_data.get("barrier_count", 0),
            extra_data=segment_data.get("extra_data", {}),
        )
        self.db.add(segment)
        await self.db.flush()
        return segment

    # -----------------------------------------------------------------------
    # RouteConstraint
    # -----------------------------------------------------------------------

    async def create_route_constraint(
        self,
        route_request_id: UUID,
        constraint_data: dict
    ) -> RouteConstraint:
        constraint = RouteConstraint(
            route_request_id=route_request_id,
            constraint_type=constraint_data["constraint_type"],
            value=constraint_data.get("value", {}),
            priority=constraint_data.get("priority", 0),
        )
        self.db.add(constraint)
        await self.db.flush()
        return constraint

    async def get_route_constraints(self, route_request_id: UUID) -> list[RouteConstraint]:
        stmt = select(RouteConstraint).where(RouteConstraint.route_request_id == route_request_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
