from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.v1.routes import check_route_impact
from app.schemas.base import ResponseWrapper

router = APIRouter(prefix="/internal", tags=["Internal"])


@router.post("/routes/{route_id}/impact", response_model=ResponseWrapper[dict])
async def check_route_impact_internal(
    route_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await check_route_impact(route_id, db)
