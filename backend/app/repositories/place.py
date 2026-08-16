from typing import Optional, Tuple
from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from geoalchemy2.functions import ST_DWithin, ST_Distance

from app.models.place import Place, Facility, AssistancePoint
from app.repositories.base import BaseRepository


class PlaceRepository(BaseRepository):
    """Repository handling database operations for Places, Facilities, and AssistancePoints."""

    async def get_by_id(self, place_id: UUID) -> Optional[Place]:
        stmt = (
            select(Place)
            .where(Place.id == place_id)
            .options(
                selectinload(Place.accessibility_records),
                selectinload(Place.facilities),
                selectinload(Place.assistance_points),
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_place(self, place_data: dict) -> Place:
        # location is passed as dict/schema Coordinate, convert to WKT POINT
        lon = place_data["location"]["lng"]
        lat = place_data["location"]["lat"]
        location_wkt = f"SRID=4326;POINT({lon} {lat})"
        
        place = Place(
            name=place_data["name"],
            description=place_data["description"],
            category=place_data["category"],
            address=place_data.get("address"),
            city=place_data.get("city"),
            region=place_data.get("region"),
            country=place_data.get("country", "India"),
            location=func.ST_GeogFromText(location_wkt),
            website_url=place_data.get("website_url"),
            phone=place_data.get("phone"),
            opening_hours=place_data.get("opening_hours", {}),
            source_type=place_data.get("source_type", "DEMO"),
            source_url=place_data.get("source_url"),
            source_reference=place_data.get("source_reference"),
            status=place_data.get("status", "ACTIVE")
        )
        self.db.add(place)
        await self.db.flush()
        return place

    async def list_places(
        self,
        q: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[list[Place], int]:
        stmt = select(Place).where(Place.status == "ACTIVE")
        
        if q:
            stmt = stmt.where(
                or_(
                    Place.name.ilike(f"%{q}%"),
                    Place.description.ilike(f"%{q}%")
                )
            )
        if category:
            stmt = stmt.where(Place.category == category)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar_one()

        # Paginate
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def nearby_search(
        self,
        lat: float,
        lng: float,
        radius_meters: float,
        q: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[list[tuple[Place, float]], int]:
        """Search places within a radius of (lat, lng) using PostGIS geography."""
        center_geog = func.ST_GeogFromText(f"SRID=4326;POINT({lng} {lat})")
        
        stmt = select(
            Place, 
            func.ST_Distance(Place.location, center_geog).label("distance")
        ).where(
            Place.status == "ACTIVE",
            func.ST_DWithin(Place.location, center_geog, radius_meters)
        )

        if q:
            stmt = stmt.where(
                or_(
                    Place.name.ilike(f"%{q}%"),
                    Place.description.ilike(f"%{q}%")
                )
            )
        if category:
            stmt = stmt.where(Place.category == category)

        stmt = stmt.order_by("distance")

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar_one()

        # Paginate
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(stmt)
        
        rows = result.all()
        # rows is a list of Row tuples (Place, distance)
        return [(row[0], float(row[1])) for row in rows], total
