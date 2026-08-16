from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select

from app.models.accessibility import AccessibilityRecord
from app.repositories.base import BaseRepository


class AccessibilityRepository(BaseRepository):
    """Repository handling database operations for AccessibilityRecords."""

    async def get_by_id(self, record_id: UUID) -> Optional[AccessibilityRecord]:
        stmt = select(AccessibilityRecord).where(AccessibilityRecord.id == record_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_records_for_place(self, place_id: UUID, exclude_expired: bool = True) -> list[AccessibilityRecord]:
        stmt = select(AccessibilityRecord).where(AccessibilityRecord.place_id == place_id)
        if exclude_expired:
            now = datetime.now(timezone.utc)
            stmt = stmt.where(
                (AccessibilityRecord.expires_at == None) | (AccessibilityRecord.expires_at > now)
            )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_record(self, place_id: UUID, record_data: dict) -> AccessibilityRecord:
        record = AccessibilityRecord(
            place_id=place_id,
            feature=record_data["feature"],
            status=record_data["status"],
            description=record_data.get("description"),
            confidence=record_data.get("confidence", "UNKNOWN"),
            source_type=record_data.get("source_type", "DEMO"),
            source_reference=record_data.get("source_reference"),
            expires_at=record_data.get("expires_at"),
            last_verified_at=record_data.get("last_verified_at")
        )
        self.db.add(record)
        await self.db.flush()
        return record

    async def update_record(self, record_id: UUID, record_data: dict) -> Optional[AccessibilityRecord]:
        record = await self.get_by_id(record_id)
        if not record:
            return None
            
        for key, val in record_data.items():
            if hasattr(record, key) and val is not None:
                setattr(record, key, val)
                
        await self.db.flush()
        return record
