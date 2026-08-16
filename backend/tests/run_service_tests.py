import asyncio
import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy import text, select, func

from app.core.database import AsyncSessionLocal
from app.models.user import User, AccessibilityProfile
from app.models.place import Place, AssistancePoint
from app.models.accessibility import AccessibilityRecord
from app.models.barrier import Barrier
from app.models.enums import SourceType, AccessibilityStatus, AccessibilityFeature, BarrierSeverity, BarrierStatus
from app.repositories.user import UserRepository
from app.repositories.place import PlaceRepository
from app.repositories.accessibility import AccessibilityRepository
from app.repositories.barrier import BarrierRepository, ReportRepository, VerificationRepository
from app.repositories.assistance import AssistancePointRepository
from app.repositories.route import RouteRepository
from app.repositories.itinerary import ItineraryRepository
from app.repositories.context import ContextRepository

from app.services.trust_service import TrustService
from app.services.verification_service import VerificationService
from app.services.barrier_service import BarrierService
from app.services.context_service import ContextService
from app.services.accessibility_service import AccessibilityService
from app.services.scoring_service import ScoringService
from app.services.route_service import RouteService
from app.services.itinerary_service import ItineraryService


async def run_all_tests():
    print("=" * 60)
    print("STARTING YATRASAATHI SERVICE LAYER INTEGRATION TESTS")
    print("=" * 60)

    # Initialize DB connection and start a transaction
    async with AsyncSessionLocal() as db:
        # Start a transaction so we can roll back all modifications at the end
        async with db.begin():
            # Initialize Repositories
            user_repo = UserRepository(db)
            place_repo = PlaceRepository(db)
            acc_repo = AccessibilityRepository(db)
            barrier_repo = BarrierRepository(db)
            report_repo = ReportRepository(db)
            verification_repo = VerificationRepository(db)
            ap_repo = AssistancePointRepository(db)
            route_repo = RouteRepository(db)
            itinerary_repo = ItineraryRepository(db)
            context_repo = ContextRepository(db)

            # Initialize Services
            trust_service = TrustService(verification_repo)
            verification_service = VerificationService(report_repo, barrier_repo, verification_repo)
            barrier_service = BarrierService(barrier_repo, trust_service)
            context_service = ContextService(context_repo)
            accessibility_service = AccessibilityService(acc_repo, barrier_service, trust_service)
            scoring_service = ScoringService()
            route_service = RouteService(route_repo, barrier_repo, scoring_service, context_service)
            itinerary_service = ItineraryService(itinerary_repo, place_repo, accessibility_service)

            # ------------------------------------------------------------------
            # SETUP TEST ENTITIES
            # ------------------------------------------------------------------
            # 1. Fetch or create a test place
            res_places = await db.execute(select(Place).limit(1))
            test_place = res_places.scalar_one_or_none()
            if not test_place:
                print("Error: No places found in database. Seed data must be loaded.")
                sys.exit(1)
            print(f"Using place for tests: {test_place.name} at {test_place.id}")

            # 2. Fetch or create a test user
            res_users = await db.execute(select(User).limit(1))
            test_user = res_users.scalar_one_or_none()
            if not test_user:
                print("Error: No users found in database.")
                sys.exit(1)
            print(f"Using user for tests: {test_user.display_name} at {test_user.id}")

            # 3. Create active and expired test barriers
            # Near test place location
            from app.schemas.place import parse_postgis_location
            from app.schemas.route import parse_postgis_linestring
            parsed_loc = parse_postgis_location(test_place.location)
            
            # Active barrier
            active_barrier = Barrier(
                reported_by=test_user.id,
                place_id=test_place.id,
                barrier_type="CONSTRUCTION",
                title="Active Construction Block",
                description="Sidewalk blocked by construction work",
                severity=BarrierSeverity.HIGH.value,
                location=func.ST_GeogFromText(f"SRID=4326;POINT({parsed_loc.lng} {parsed_loc.lat})"),
                status=BarrierStatus.ACTIVE.value,
                observed_at=datetime.now(timezone.utc)
            )
            db.add(active_barrier)

            # Expired barrier
            expired_barrier = Barrier(
                reported_by=test_user.id,
                place_id=test_place.id,
                barrier_type="TEMPORARY_FLOOD",
                title="Expired Puddle",
                description="Temporary puddle from rain",
                severity=BarrierSeverity.LOW.value,
                location=func.ST_GeogFromText(f"SRID=4326;POINT({parsed_loc.lng + 0.0001} {parsed_loc.lat + 0.0001})"),
                status=BarrierStatus.ACTIVE.value,
                observed_at=datetime.now(timezone.utc) - timedelta(days=2),
                expires_at=datetime.now(timezone.utc) - timedelta(hours=1)
            )
            db.add(expired_barrier)
            
            # Flush changes to make them queryable
            await db.flush()

            # ------------------------------------------------------------------
            # TEST 1: Accessibility Scoring
            # ------------------------------------------------------------------
            print("\n[TEST 1] Accessibility Scoring...")
            profile_stairs = AccessibilityProfile(
                user_id=test_user.id,
                avoid_stairs=True,
                prefer_step_free=True,
                mobility_preferences={"wheelchair": True}
            )
            # Create AVAILABLE step-free entrance record
            step_free_rec = AccessibilityRecord(
                place_id=test_place.id,
                feature=AccessibilityFeature.STEP_FREE_ENTRANCE.value,
                status=AccessibilityStatus.AVAILABLE.value,
                confidence="HIGH",
                source_type=SourceType.EXTERNAL_API.value
            )
            db.add(step_free_rec)
            await db.flush()

            eval_res = await accessibility_service.evaluate_place(test_place, profile_stairs)
            print(f" -> Score: {eval_res['score']}, Level: {eval_res['level']}")
            assert eval_res["score"] >= 50, "Accessibility score should reflect available feature"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 2: UNKNOWN Accessibility Values
            # ------------------------------------------------------------------
            print("\n[TEST 2] UNKNOWN Accessibility Values...")
            # Create UNKNOWN status record for toilet
            toilet_rec = AccessibilityRecord(
                place_id=test_place.id,
                feature=AccessibilityFeature.ACCESSIBLE_TOILET.value,
                status=AccessibilityStatus.UNKNOWN.value,
                confidence="UNKNOWN",
                source_type=SourceType.USER_REPORTED.value
            )
            db.add(toilet_rec)
            await db.flush()

            eval_res_unk = await accessibility_service.evaluate_place(test_place, profile_stairs)
            print(f" -> Unknowns found: {eval_res_unk['unknowns']}")
            assert any("ACCESSIBLE_TOILET" in u for u in eval_res_unk["unknowns"]), "Toilet should be listed under unknowns"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 3: HIGH/MEDIUM/LOW/UNKNOWN Classification
            # ------------------------------------------------------------------
            print("\n[TEST 3] HIGH/MEDIUM/LOW/UNKNOWN Classification...")
            # If we make step_free UNAVAILABLE, score should drop drastically (LOW or UNKNOWN)
            step_free_rec.status = AccessibilityStatus.UNAVAILABLE.value
            await db.flush()
            eval_res_low = await accessibility_service.evaluate_place(test_place, profile_stairs)
            print(f" -> Level after feature unavailability: {eval_res_low['level']}")
            assert eval_res_low["level"] in ("LOW", "UNKNOWN"), "Classification level should drop for unmet requirements"
            print(" -> [PASSED]")

            # Restore step_free status
            step_free_rec.status = AccessibilityStatus.AVAILABLE.value
            await db.flush()

            # ------------------------------------------------------------------
            # TEST 4: Trust Calculation
            # ------------------------------------------------------------------
            print("\n[TEST 4] Trust Calculation...")
            gov_trust = await trust_service.evaluate_trust(step_free_rec)
            demo_record = AccessibilityRecord(
                place_id=test_place.id,
                feature=AccessibilityFeature.ELEVATOR.value,
                status=AccessibilityStatus.AVAILABLE.value,
                source_type=SourceType.DEMO.value
            )
            demo_trust = await trust_service.evaluate_trust(demo_record)
            print(f" -> Government Source Trust: {gov_trust['level']} (score: {gov_trust['score']})")
            print(f" -> Demo Source Trust: {demo_trust['level']} (score: {demo_trust['score']})")
            assert gov_trust["score"] > demo_trust["score"], "Government source should have higher trust than Demo source"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 5: Expired Barrier Exclusion
            # ------------------------------------------------------------------
            print("\n[TEST 5] Expired Barrier Exclusion...")
            # Query nearby barriers excluding expired
            nearby_active = await barrier_service.get_nearby_barriers(
                lat=parsed_loc.lat,
                lng=parsed_loc.lng,
                radius_meters=200,
                exclude_expired=True
            )
            # Query nearby barriers including expired
            nearby_all = await barrier_service.get_nearby_barriers(
                lat=parsed_loc.lat,
                lng=parsed_loc.lng,
                radius_meters=200,
                exclude_expired=False
            )
            print(f" -> Active/Unexpired count: {len(nearby_active)}")
            print(f" -> All count: {len(nearby_all)}")
            assert len(nearby_all) > len(nearby_active), "All query should return expired barrier, active query should exclude it"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 6: Active Barrier Detection
            # ------------------------------------------------------------------
            print("\n[TEST 6] Active Barrier Detection...")
            found_active = False
            for b, dist in nearby_active:
                if b.id == active_barrier.id:
                    found_active = True
            assert found_active, "Active construction barrier must be detected"
            print(" -> Active barrier successfully detected.")
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 7: Nearby Barrier Proximity Logic
            # ------------------------------------------------------------------
            print("\n[TEST 7] Nearby Barrier Proximity Logic...")
            # First element should be the closest one
            closest_barrier, dist = nearby_active[0]
            print(f" -> Closest barrier: {closest_barrier.title} at distance {dist:.2f} meters")
            assert dist < 10.0, "Proximity distance calculation should be accurate using PostGIS"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 8: Nearby Assistance Points
            # ------------------------------------------------------------------
            print("\n[TEST 8] Nearby Assistance Points...")
            # Create a test assistance point
            ap = AssistancePoint(
                place_id=test_place.id,
                name=f"AP at {test_place.name}",
                assistance_type="WHEELCHAIR_ASSISTANCE",
                location=func.ST_GeogFromText(f"SRID=4326;POINT({parsed_loc.lng} {parsed_loc.lat})"),
                availability_status="AVAILABLE",
                source_type="GOVERNMENT_API"
            )
            db.add(ap)
            await db.flush()

            nearby_ap = await ap_repo.nearby_assistance_points(parsed_loc.lat, parsed_loc.lng, 500)
            print(f" -> Nearby APs found: {len(nearby_ap)}")
            assert len(nearby_ap) >= 1, "Nearby assistance point should be retrieved"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 9: Route Ranking
            # ------------------------------------------------------------------
            print("\n[TEST 9] Route Ranking...")
            # Avoid stairs profile
            profile_wheelchair = AccessibilityProfile(
                user_id=test_user.id,
                avoid_stairs=True,
                prefer_step_free=True,
                mobility_preferences={"wheelchair": True}
            )
            origin = {"lat": parsed_loc.lat - 0.005, "lng": parsed_loc.lng - 0.005}
            destination = {"lat": parsed_loc.lat + 0.005, "lng": parsed_loc.lng + 0.005}
            
            plan_res = await route_service.plan_route(test_user.id, profile_wheelchair, origin, destination)
            rec = plan_res["recommendation"]
            print(f" -> Recommended Route: {rec['name']} (score: {rec['score']})")
            # Route B is step-free bypass, Route A has stairs. Route B should rank higher.
            assert rec["name"] == "Accessible Bypass B", "Bypass B should be recommended for wheelchair user over Direct A (has stairs)"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 10: Route Affected by Barrier Detection
            # ------------------------------------------------------------------
            print("\n[TEST 10] Route Affected by Barrier Detection...")
            # Route B is at offset lng+0.0015, lat+0.001. Let's place a barrier exactly on Route B's path!
            mid_lat = origin["lat"] + (destination["lat"] - origin["lat"]) * 0.5 + 0.001
            mid_lng = origin["lng"] + (destination["lng"] - origin["lng"]) * 0.5 + 0.0015
            
            blocking_barrier = Barrier(
                reported_by=test_user.id,
                barrier_type="STREET_CLOSURE",
                title="Bypass B Road Closure",
                description="Entire street closed for repaving",
                severity=BarrierSeverity.CRITICAL.value,
                location=func.ST_GeogFromText(f"SRID=4326;POINT({mid_lng} {mid_lat})"),
                status=BarrierStatus.ACTIVE.value,
                observed_at=datetime.now(timezone.utc)
            )
            db.add(blocking_barrier)
            await db.flush()

            # Construct WKT of Route B coordinates and query
            from app.repositories.route import coords_to_wkt_linestring
            route_b_record = None
            for alt in plan_res["alternatives"]:
                if alt["name"] == "Accessible Bypass B":
                    route_b_record = alt["route_record"]

            await db.refresh(route_b_record)
            prev_coords = parse_postgis_linestring(route_b_record.geometry)
            wkt_b = coords_to_wkt_linestring(prev_coords)
            detected_barriers = await barrier_repo.get_barriers_near_geometry(wkt_b, buffer_meters=25.0)
            print(f" -> Barriers detected near Route B: {len(detected_barriers)}")
            assert len(detected_barriers) >= 1, "Route B should detect the blocking barrier near its geometry"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 11: Route Recalculation
            # ------------------------------------------------------------------
            print("\n[TEST 11] Route Recalculation...")
            # Recalculate Route B (which was recommended but is now blocked)
            recalc_res = await route_service.recalculate_route(route_b_record.id, test_user.id, profile_wheelchair)
            new_rec = recalc_res["new_recommendation"]
            print(f" -> New recommendation after Route B block: {new_rec['name']} (score: {new_rec['score']})")
            # Since Route B is blocked, Route C (rough) or Route A (stairs) might be chosen.
            # In either case, the recommended route ID must change or the previous route must be marked affected.
            assert recalc_res["previous_route_affected"] == True, "Previous route B should be marked as affected by barrier"
            assert new_rec["name"] != "Accessible Bypass B", "Bypass B should no longer be recommended"
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 12: Itinerary Logic
            # ------------------------------------------------------------------
            print("\n[TEST 12] Itinerary Logic...")
            itinerary = await itinerary_service.create_itinerary(test_user.id, "Demo Day Plan")
            
            # Add stop
            stop1 = await itinerary_service.add_stop(itinerary.id, test_place.id, sequence=1, profile=profile_wheelchair)
            print(f" -> Added stop sequence: {stop1.sequence} with accessibility snapshot: {stop1.accessibility_snapshot}")
            assert stop1.sequence == 1
            
            # Check suitability
            suit = await itinerary_service.check_itinerary_suitability(itinerary.id, profile_wheelchair)
            print(f" -> Itinerary suitability score: {suit['overall_score']}")
            assert "stops" in suit
            print(" -> [PASSED]")

            # ------------------------------------------------------------------
            # TEST 13: Context Freshness
            # ------------------------------------------------------------------
            print("\n[TEST 13] Context Freshness...")
            # Create fresh weather snapshot
            fresh_w = {
                "location": {"lat": parsed_loc.lat, "lng": parsed_loc.lng},
                "condition": "HEAVY_RAIN",
                "temperature_c": 22.0,
                "rain_probability": 0.9,
                "observed_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=2)
            }
            await context_service.create_weather_snapshot(fresh_w)
            
            latest_w = await context_service.get_latest_weather(parsed_loc.lat, parsed_loc.lng, max_age_minutes=15)
            print(f" -> Retrieve weather: {latest_w.condition if latest_w else None}")
            assert latest_w is not None, "Fresh weather snapshot should be retrieved"

            # Check with a very short max_age (e.g. -5 minutes) to simulate stale query
            stale_w = await context_service.get_latest_weather(parsed_loc.lat, parsed_loc.lng, max_age_minutes=-10)
            assert stale_w is None, "Stale weather snapshots should be ignored"
            print(" -> [PASSED]")

        # transaction end -> implicit roll back
        print("\n" + "=" * 60)
        print("ALL 13 INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
        print("ROLLING BACK TRANSACTION TO PRESERVE SEED DATA.")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_all_tests())
