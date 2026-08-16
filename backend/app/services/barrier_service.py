from typing import Optional, Tuple
from uuid import UUID
from datetime import datetime, timezone

from app.models.barrier import Barrier
from app.repositories.barrier import BarrierRepository
from app.services.exceptions import NotFoundException
from app.services.trust_service import TrustService


class BarrierService:
    """
    Handles business logic for accessibility barriers, including active/expired states,
    proximity queries, status transitions, and trust calculations.
    """

    def __init__(self, barrier_repo: BarrierRepository, trust_service: TrustService):
        self.barrier_repo = barrier_repo
        self.trust_service = trust_service

    async def get_barrier(self, barrier_id: UUID) -> Optional[Barrier]:
        barrier = await self.barrier_repo.get_by_id(barrier_id)
        if not barrier:
            raise NotFoundException("Barrier not found.")
        return barrier

    async def get_barrier_with_trust(self, barrier_id: UUID) -> dict:
        barrier = await self.get_barrier(barrier_id)
        trust_info = await self.trust_service.evaluate_trust(barrier)
        return {
            "barrier": barrier,
            "trust": trust_info
        }

    async def create_barrier(self, reported_by: UUID, barrier_data: dict) -> Barrier:
        return await self.barrier_repo.create_barrier(reported_by, barrier_data)

    async def get_nearby_barriers(
        self,
        lat: float,
        lng: float,
        radius_meters: float,
        exclude_expired: bool = True
    ) -> list[tuple[Barrier, float]]:
        """
        Retrieves active barriers within a specified radius using PostGIS.
        If exclude_expired is True, filters out temporary barriers that have already expired.
        """
        # Call the repository method
        return await self.barrier_repo.nearby_barriers(
            lat=lat,
            lng=lng,
            radius_meters=radius_meters,
            status="ACTIVE",
            exclude_expired=exclude_expired
        )

    async def update_barrier_status(
        self,
        barrier_id: UUID,
        status: str,
        verified_by: Optional[UUID] = None,
        reason: Optional[str] = None
    ) -> Barrier:
        """
        Updates barrier status and adds a verification record if verified_by/reason is provided.
        """
        barrier = await self.barrier_repo.get_by_id(barrier_id)
        if not barrier:
            raise NotFoundException("Barrier not found.")

        verified_at = datetime.now(timezone.utc) if status == "ACTIVE" else None
        updated = await self.barrier_repo.update_barrier_status(barrier_id, status, verified_at)
        
        # If human verification context provided, log verification audit
        if verified_by and reason and self.trust_service.verification_repo:
            verification_data = {
                "action": "VERIFY" if status == "ACTIVE" else "DISPUTE",
                "reason": reason,
                "previous_status": barrier.status,
                "new_status": status,
            }
            await self.trust_service.verification_repo.create_verification(
                verified_by=verified_by,
                verification_data=verification_data,
                barrier_id=barrier_id,
            )

        return updated
