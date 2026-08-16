from typing import Optional, Tuple
from uuid import UUID
from sqlalchemy import select, func
from geoalchemy2.functions import ST_DWithin, ST_Distance

from app.models.place import AssistancePoint
from app.repositories.base import BaseRepository


class AssistancePointRepository(BaseRepository):
    """Repository handling database operations for AssistancePoints."""

    async def get_by_id(self, assistance_point_id: UUID) -> Optional[AssistancePoint]:
        stmt = select(AssistancePoint).where(AssistancePoint.id == assistance_point_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_assistance_points(
        self,
        place_id: Optional[UUID] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[AssistancePoint], int]:
        stmt = select(AssistancePoint)
        if place_id:
            stmt = stmt.where(AssistancePoint.place_id == place_id)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar_one()

        # Paginate
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def nearby_assistance_points(
        self,
        lat: float,
        lng: float,
        radius_meters: float,
        assistance_type: Optional[str] = None,
    ) -> list[tuple[AssistancePoint, float]]:
        """Find assistance points near a location using PostGIS geography."""
        center_geog = func.ST_GeogFromText(f"SRID=4326;POINT({lng} {lat})")
        
        stmt = select(
            AssistancePoint,
            func.ST_Distance(AssistancePoint.location, center_geog).label("distance")
        ).where(
            func.ST_DWithin(AssistancePoint.location, center_geog, radius_meters)
        )

        if assistance_type:
            stmt = stmt.where(AssistancePoint.assistance_type == assistance_type)

        stmt = stmt.order_by("distance")
        result = await self.db.execute(stmt)
        rows = result.all()
        return [(row[0], float(row[1])) for row in rows]

    async def create_assistance_point(self, assistance_data: dict) -> AssistancePoint:
        lon = assistance_data["location"]["lng"]
        lat = assistance_data["location"]["lat"]
        location_wkt = f"SRID=4326;POINT({lon} {lat})"

        ap = AssistancePoint(
            place_id=assistance_data.get("place_id"),
            name=assistance_data["name"],
            assistance_type=assistance_data["assistance_type"],
            description=assistance_data.get("description"),
            location=func.ST_GeogFromText(location_wkt),
            availability_status=assistance_data.get("availability_status", "UNKNOWN"),
            source_type=assistance_data.get("source_type", "DEMO"),
        )
        self.db.add(ap)
        await self.db.flush()
        return ap
