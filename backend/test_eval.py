import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models import Place, User, AccessibilityProfile, AccessibilityRecord, Barrier
from app.repositories.accessibility import AccessibilityRepository
from app.repositories.barrier import BarrierRepository, VerificationRepository
from app.services.trust_service import TrustService
from app.services.barrier_service import BarrierService
from app.services.accessibility_service import AccessibilityService

async def main():
    async with AsyncSessionLocal() as db:
        res_places = await db.execute(select(Place).limit(1))
        place = res_places.scalar_one()
        
        res_users = await db.execute(select(User).limit(1))
        user = res_users.scalar_one()
        
        profile = AccessibilityProfile(
            user_id=user.id,
            avoid_stairs=True,
            prefer_step_free=True,
            mobility_preferences={"wheelchair": True}
        )
        
        acc_repo = AccessibilityRepository(db)
        barrier_repo = BarrierRepository(db)
        verification_repo = VerificationRepository(db)
        
        trust_service = TrustService(verification_repo)
        barrier_service = BarrierService(barrier_repo, trust_service)
        accessibility_service = AccessibilityService(acc_repo, barrier_service, trust_service)
        
        eval_res = await accessibility_service.evaluate_place(place, profile)
        print("PLACE:", place.name)
        print("SCORE:", eval_res["score"])
        print("LEVEL:", eval_res["level"])
        print("REASONS:", eval_res["reasons"])
        print("WARNINGS:", eval_res["warnings"])
        print("UNKNOWNS:", eval_res["unknowns"])

if __name__ == "__main__":
    asyncio.run(main())
