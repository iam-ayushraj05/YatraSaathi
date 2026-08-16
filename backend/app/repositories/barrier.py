from typing import Optional, Tuple
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from geoalchemy2.functions import ST_DWithin, ST_Distance

from app.models.barrier import Barrier, Evidence, Verification, EvidenceObservation
from app.models.report import Report
from app.repositories.base import BaseRepository


class BarrierRepository(BaseRepository):
    """Repository handling database operations for Barriers."""

    async def get_by_id(self, barrier_id: UUID) -> Optional[Barrier]:
        stmt = (
            select(Barrier)
            .where(Barrier.id == barrier_id)
            .options(
                selectinload(Barrier.evidence),
                selectinload(Barrier.verifications),
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_barrier(self, reported_by: UUID, barrier_data: dict) -> Barrier:
        lon = barrier_data["location"]["lng"]
        lat = barrier_data["location"]["lat"]
        location_wkt = f"SRID=4326;POINT({lon} {lat})"

        barrier = Barrier(
            place_id=barrier_data.get("place_id"),
            reported_by=reported_by,
            report_id=barrier_data.get("report_id"),
            barrier_type=barrier_data["barrier_type"],
            title=barrier_data["title"],
            description=barrier_data["description"],
            severity=barrier_data.get("severity", "MEDIUM"),
            location=func.ST_GeogFromText(location_wkt),
            status=barrier_data.get("status", "SUBMITTED"),
            observed_at=barrier_data.get("observed_at", datetime.now(timezone.utc)),
            expires_at=barrier_data.get("expires_at"),
        )
        self.db.add(barrier)
        await self.db.flush()
        return barrier

    async def list_barriers(
        self,
        place_id: Optional[UUID] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Barrier], int]:
        stmt = select(Barrier)
        if place_id:
            stmt = stmt.where(Barrier.place_id == place_id)
        if status:
            stmt = stmt.where(Barrier.status == status)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar_one()

        # Paginate
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def nearby_barriers(
        self,
        lat: float,
        lng: float,
        radius_meters: float,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        exclude_expired: bool = True,
    ) -> list[tuple[Barrier, float]]:
        """Find barriers near a location using PostGIS geography, filtering out expired ones if requested."""
        center_geog = func.ST_GeogFromText(f"SRID=4326;POINT({lng} {lat})")
        
        stmt = select(
            Barrier,
            func.ST_Distance(Barrier.location, center_geog).label("distance")
        ).where(
            func.ST_DWithin(Barrier.location, center_geog, radius_meters)
        )

        if status:
            stmt = stmt.where(Barrier.status == status)
        if severity:
            stmt = stmt.where(Barrier.severity == severity)

        if exclude_expired:
            now = datetime.now(timezone.utc)
            # A temporary barrier with expires_at in the past is excluded.
            stmt = stmt.where(
                (Barrier.expires_at == None) | (Barrier.expires_at > now)
            )

        stmt = stmt.order_by("distance")
        result = await self.db.execute(stmt)
        rows = result.all()
        return [(row[0], float(row[1])) for row in rows]

    async def get_barriers_near_geometry(
        self,
        wkt: str,
        buffer_meters: float = 15.0,
        exclude_expired: bool = True
    ) -> list[Barrier]:
        """Retrieve active barriers within buffer_meters of a route geometry."""
        now = datetime.now(timezone.utc)
        stmt = select(Barrier).where(
            Barrier.status == "ACTIVE",
            func.ST_DWithin(Barrier.location, func.ST_GeomFromText(wkt, 4326), buffer_meters)
        )
        if exclude_expired:
            stmt = stmt.where(
                (Barrier.expires_at == None) | (Barrier.expires_at > now)
            )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update_barrier_status(self, barrier_id: UUID, status: str, verified_at: Optional[datetime] = None) -> Optional[Barrier]:
        barrier = await self.get_by_id(barrier_id)
        if not barrier:
            return None
        barrier.status = status
        if verified_at:
            barrier.verified_at = verified_at
        await self.db.flush()
        return barrier


class ReportRepository(BaseRepository):
    """Repository handling database operations for Reports."""

    async def get_by_id(self, report_id: UUID) -> Optional[Report]:
        stmt = (
            select(Report)
            .where(Report.id == report_id)
            .options(
                selectinload(Report.evidence),
                selectinload(Report.verifications),
                selectinload(Report.barrier),
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_report(self, user_id: UUID, report_data: dict) -> Report:
        location_geom = None
        if report_data.get("location"):
            lon = report_data["location"]["lng"]
            lat = report_data["location"]["lat"]
            location_geom = func.ST_GeogFromText(f"SRID=4326;POINT({lon} {lat})")

        report = Report(
            user_id=user_id,
            place_id=report_data.get("place_id"),
            report_type=report_data["report_type"],
            title=report_data["title"],
            description=report_data["description"],
            location=location_geom,
            status=report_data.get("status", "SUBMITTED"),
        )
        self.db.add(report)
        await self.db.flush()
        return report

    async def list_reports(
        self,
        user_id: Optional[UUID] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Report], int]:
        stmt = select(Report)
        if user_id:
            stmt = stmt.where(Report.user_id == user_id)
        if status:
            stmt = stmt.where(Report.status == status)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar_one()

        # Paginate
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total

    async def update_report_status(self, report_id: UUID, status: str) -> Optional[Report]:
        report = await self.get_by_id(report_id)
        if not report:
            return None
        report.status = status
        await self.db.flush()
        return report


class EvidenceRepository(BaseRepository):
    """Repository handling database operations for Evidence and EvidenceObservation."""

    async def get_by_id(self, evidence_id: UUID) -> Optional[Evidence]:
        stmt = select(Evidence).where(Evidence.id == evidence_id).options(selectinload(Evidence.observations))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_evidence(
        self,
        uploaded_by: UUID,
        evidence_data: dict,
        report_id: Optional[UUID] = None,
        barrier_id: Optional[UUID] = None,
    ) -> Evidence:
        evidence = Evidence(
            report_id=report_id,
            barrier_id=barrier_id,
            uploaded_by=uploaded_by,
            storage_key=evidence_data["storage_key"],
            original_filename=evidence_data["original_filename"],
            mime_type=evidence_data["mime_type"],
            file_size_bytes=evidence_data["file_size_bytes"],
            sha256_hash=evidence_data["sha256_hash"],
            ai_analysis=evidence_data.get("ai_analysis", {}),
            ai_confidence=evidence_data.get("ai_confidence"),
        )
        self.db.add(evidence)
        await self.db.flush()
        return evidence

    async def create_observation(self, evidence_id: UUID, observation_data: dict) -> EvidenceObservation:
        obs = EvidenceObservation(
            evidence_id=evidence_id,
            model_name=observation_data["model_name"],
            observation_type=observation_data["observation_type"],
            observation=observation_data["observation"],
            confidence=observation_data.get("confidence"),
        )
        self.db.add(obs)
        await self.db.flush()
        return obs


class VerificationRepository(BaseRepository):
    """Repository handling database operations for Verifications."""

    async def get_by_id(self, verification_id: UUID) -> Optional[Verification]:
        stmt = select(Verification).where(Verification.id == verification_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_verification(
        self,
        verified_by: UUID,
        verification_data: dict,
        report_id: Optional[UUID] = None,
        barrier_id: Optional[UUID] = None,
    ) -> Verification:
        verification = Verification(
            report_id=report_id,
            barrier_id=barrier_id,
            verified_by=verified_by,
            action=verification_data["action"],
            reason=verification_data["reason"],
            previous_status=verification_data.get("previous_status"),
            new_status=verification_data.get("new_status"),
        )
        self.db.add(verification)
        await self.db.flush()
        return verification

    async def get_verifications_for_barrier(self, barrier_id: UUID) -> list[Verification]:
        stmt = select(Verification).where(Verification.barrier_id == barrier_id).order_by(Verification.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_verifications_for_report(self, report_id: UUID) -> list[Verification]:
        stmt = select(Verification).where(Verification.report_id == report_id).order_by(Verification.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
