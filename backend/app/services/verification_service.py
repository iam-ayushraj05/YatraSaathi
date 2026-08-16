from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from app.models.enums import ReportStatus, BarrierStatus, VerificationAction
from app.repositories.barrier import BarrierRepository, ReportRepository, VerificationRepository
from app.services.exceptions import NotFoundException, ValidationError


class VerificationService:
    """
    Handles report verification workflows, creating barriers from reports,
    disputing claims, and resolving active barriers.
    """

    def __init__(
        self,
        report_repo: ReportRepository,
        barrier_repo: BarrierRepository,
        verification_repo: VerificationRepository,
    ):
        self.report_repo = report_repo
        self.barrier_repo = barrier_repo
        self.verification_repo = verification_repo

    async def verify_report(
        self,
        report_id: UUID,
        verified_by: UUID,
        reason: str,
        barrier_type: str,
        severity: str = "MEDIUM",
        expires_at: Optional[datetime] = None,
    ):
        """
        Verify a user report. Creates an active Barrier from the report
        and adds a verification audit record.
        """
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise NotFoundException("Report not found.")

        if report.status in (ReportStatus.VERIFIED.value, ReportStatus.REJECTED.value):
            raise ValidationError(f"Report cannot be verified from state: {report.status}")

        previous_status = report.status
        # Update report status
        await self.report_repo.update_report_status(report_id, ReportStatus.VERIFIED.value)

        # Parse location coordinate from PostGIS geometry
        # location is a geoalchemy2 element. We can fetch it, but let's parse it manually or via helper
        # Wait, report.location is Geography(POINT). Let's extract lat/lng for creating the barrier.
        # How? If we load the report, we can read it. Let's write a small helper to parse coordinates from the db.
        # Wait, the repository or schemas already has parse_postgis_location.
        from app.schemas.place import parse_postgis_location
        parsed_loc = parse_postgis_location(report.location)
        if not parsed_loc:
            raise ValidationError("Report has no valid coordinates to create a barrier.")

        # Create barrier
        barrier_data = {
            "place_id": report.place_id,
            "report_id": report.id,
            "barrier_type": barrier_type,
            "title": report.title,
            "description": report.description,
            "severity": severity,
            "location": {
                "lng": parsed_loc.lng,
                "lat": parsed_loc.lat,
            },
            "status": BarrierStatus.ACTIVE.value,
            "observed_at": report.created_at,
            "expires_at": expires_at,
        }

        barrier = await self.barrier_repo.create_barrier(report.user_id, barrier_data)

        # Create verification record
        verification_data = {
            "action": VerificationAction.VERIFY.value,
            "reason": reason,
            "previous_status": previous_status,
            "new_status": ReportStatus.VERIFIED.value,
        }
        await self.verification_repo.create_verification(
            verified_by=verified_by,
            verification_data=verification_data,
            report_id=report.id,
            barrier_id=barrier.id,
        )

        return barrier

    async def reject_report(self, report_id: UUID, verified_by: UUID, reason: str):
        """Reject a user-submitted report."""
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise NotFoundException("Report not found.")

        if report.status in (ReportStatus.VERIFIED.value, ReportStatus.REJECTED.value):
            raise ValidationError(f"Report cannot be rejected from state: {report.status}")

        previous_status = report.status
        await self.report_repo.update_report_status(report_id, ReportStatus.REJECTED.value)

        # Create verification record
        verification_data = {
            "action": VerificationAction.REJECT.value,
            "reason": reason,
            "previous_status": previous_status,
            "new_status": ReportStatus.REJECTED.value,
        }
        await self.verification_repo.create_verification(
            verified_by=verified_by,
            verification_data=verification_data,
            report_id=report.id,
        )
        return report

    async def resolve_barrier(self, barrier_id: UUID, resolved_by: UUID, reason: str):
        """Mark an active barrier as resolved."""
        barrier = await self.barrier_repo.get_by_id(barrier_id)
        if not barrier:
            raise NotFoundException("Barrier not found.")

        if barrier.status == BarrierStatus.RESOLVED.value:
            return barrier

        previous_status = barrier.status
        await self.barrier_repo.update_barrier_status(barrier_id, BarrierStatus.RESOLVED.value)

        # If linked to a report, resolve that report too
        if barrier.report_id:
            await self.report_repo.update_report_status(barrier.report_id, ReportStatus.RESOLVED.value)

        # Create verification audit record
        verification_data = {
            "action": VerificationAction.RESOLVE.value,
            "reason": reason,
            "previous_status": previous_status,
            "new_status": BarrierStatus.RESOLVED.value,
        }
        await self.verification_repo.create_verification(
            verified_by=resolved_by,
            verification_data=verification_data,
            report_id=barrier.report_id,
            barrier_id=barrier.id,
        )
        return barrier
