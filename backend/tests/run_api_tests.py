import asyncio
import sys
import uuid
import json
from datetime import datetime, timezone
from io import BytesIO
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

# Add parent directory to sys.path to allow importing app
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import User, AccessibilityProfile
from app.models.place import Place, Facility
from app.models.barrier import Barrier
from app.models.report import Report
from app.models.itinerary import Itinerary


async def main():
    print("==================================================")
    print("STARTING YATRASAATHI API LAYER INTEGRATION TESTS")
    print("==================================================")

    # Initialize AsyncClient using ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Base Health Checks
        print("\n[1] Testing health check endpoints...")
        resp = await client.get("/api/v1/health")
        assert resp.status_code == 200, f"Health check failed: {resp.text}"
        print("[OK] GET /api/v1/health passed:", resp.json())

        resp = await client.get("/api/v1/health/database")
        assert resp.status_code == 200, f"Database health check failed: {resp.text}"
        print("[OK] GET /api/v1/health/database passed:", resp.json())

        # 2. Authentication Flow
        print("\n[2] Testing authentication endpoints...")
        test_email = f"tester_{uuid.uuid4().hex[:6]}@example.com"
        register_payload = {
            "email": test_email,
            "password": "securepassword123",
            "display_name": "Test Traveller"
        }
        
        resp = await client.post("/api/v1/auth/register", json=register_payload)
        assert resp.status_code == 200, f"Registration failed: {resp.text}"
        print("[OK] POST /api/v1/auth/register passed")

        # Login
        login_payload = {
            "email": test_email,
            "password": "securepassword123"
        }
        resp = await client.post("/api/v1/auth/login", json=login_payload)
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        login_data = resp.json()
        assert "access_token" in login_data, "No access token in login response"
        token = login_data["access_token"]
        print("[OK] POST /api/v1/auth/login passed")

        # Set auth header
        headers = {"Authorization": f"Bearer {token}"}

        # Get /me
        resp = await client.get("/api/v1/auth/me", headers=headers)
        assert resp.status_code == 200, f"GET /me failed: {resp.text}"
        me_data = resp.json()["data"]
        assert me_data["email"] == test_email, "Email mismatch in /me"
        print("[OK] GET /api/v1/auth/me passed")

        # 3. Accessibility Profiles
        print("\n[3] Testing accessibility profiles...")
        profile_payload = {
            "avoid_stairs": True,
            "prefer_step_free": True,
            "mobility_preferences": {"wheelchair": True},
            "vision_preferences": {"tactile_guidance": False},
            "walking_limit_meters": 500
        }
        resp = await client.post("/api/v1/profiles", json=profile_payload, headers=headers)
        assert resp.status_code == 200, f"Create profile failed: {resp.text}"
        profile_data = resp.json()["data"]
        profile_id = profile_data["id"]
        print("[OK] POST /api/v1/profiles passed. Profile ID:", profile_id)

        # Get profile
        resp = await client.get(f"/api/v1/profiles/{profile_id}", headers=headers)
        assert resp.status_code == 200, f"Get profile failed: {resp.text}"
        print("[OK] GET /api/v1/profiles/{id} passed")

        # Update profile
        update_payload = {"walking_limit_meters": 750}
        resp = await client.put(f"/api/v1/profiles/{profile_id}", json=update_payload, headers=headers)
        assert resp.status_code == 200, f"Update profile failed: {resp.text}"
        assert resp.json()["data"]["walking_limit_meters"] == 750, "Update check failed"
        print("[OK] PUT /api/v1/profiles/{id} passed")

        # 4. Places & Facilities
        print("\n[4] Testing places endpoints...")
        # Fetch first active place in database to test details
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(Place).limit(1))
            place = res.scalar_one_or_none()
            assert place is not None, "No places found in seeded database"
            place_id = place.id
            # Also need coords for nearby testing
            from app.schemas.place import parse_postgis_location
            coords = parse_postgis_location(place.location)

        # List places (text query)
        resp = await client.get("/api/v1/places?q=City", headers=headers)
        assert resp.status_code == 200, f"List places failed: {resp.text}"
        print("[OK] GET /api/v1/places (text query) passed, count:", len(resp.json()["data"]))

        # List places (nearby query)
        resp = await client.get(f"/api/v1/places?lat={coords.lat}&lng={coords.lng}&radius=5000", headers=headers)
        assert resp.status_code == 200, f"List places nearby failed: {resp.text}"
        print("[OK] GET /api/v1/places (nearby query) passed, count:", len(resp.json()["data"]))

        # Get place details
        resp = await client.get(f"/api/v1/places/{place_id}", headers=headers)
        assert resp.status_code == 200, f"Get place details failed: {resp.text}"
        details = resp.json()["data"]
        print("[OK] GET /api/v1/places/{id} details passed. Name:", details["place"]["name"])

        # Get place accessibility records
        resp = await client.get(f"/api/v1/places/{place_id}/accessibility", headers=headers)
        assert resp.status_code == 200, f"Get place accessibility failed: {resp.text}"
        print("[OK] GET /api/v1/places/{id}/accessibility passed")

        # Get place facilities
        resp = await client.get(f"/api/v1/places/{place_id}/facilities", headers=headers)
        assert resp.status_code == 200, f"Get place facilities failed: {resp.text}"
        print("[OK] GET /api/v1/places/{id}/facilities passed")

        # 5. Barriers & Reports
        print("\n[5] Testing reports and barriers endpoints...")
        # List nearby barriers
        resp = await client.get(f"/api/v1/barriers/nearby?lat={coords.lat}&lng={coords.lng}&radius=5000", headers=headers)
        assert resp.status_code == 200, f"List nearby barriers failed: {resp.text}"
        nearby_barriers = resp.json()["data"]
        print("[OK] GET /api/v1/barriers/nearby passed, count:", len(nearby_barriers))

        # Get specific barrier details if exists
        if nearby_barriers:
            barrier_id = nearby_barriers[0]["id"]
            resp = await client.get(f"/api/v1/barriers/{barrier_id}", headers=headers)
            assert resp.status_code == 200, f"Get barrier details failed: {resp.text}"
            print("[OK] GET /api/v1/barriers/{id} details passed")

        # Submit report
        report_payload = {
            "place_id": str(place_id),
            "report_type": "BARRIER",
            "title": "Broken elevator at main hall",
            "description": "Elevator has been out of service for two days, blocked with construction tape.",
            "location": {"lat": coords.lat + 0.001, "lng": coords.lng + 0.001}
        }
        resp = await client.post("/api/v1/reports", json=report_payload, headers=headers)
        assert resp.status_code == 200, f"Submit report failed: {resp.text}"
        report_data = resp.json()["data"]
        report_id = report_data["id"]
        print("[OK] POST /api/v1/reports passed. Report ID:", report_id)

        # Upload evidence
        dummy_file = BytesIO(b"dummy image file content")
        resp = await client.post(
            f"/api/v1/reports/{report_id}/evidence",
            files={"file": ("test_image.jpg", dummy_file, "image/jpeg")},
            headers=headers
        )
        assert resp.status_code == 200, f"Upload evidence failed: {resp.text}"
        print("[OK] POST /api/v1/reports/{id}/evidence passed")

        # Get my reports
        resp = await client.get("/api/v1/reports/me", headers=headers)
        assert resp.status_code == 200, f"Get my reports failed: {resp.text}"
        print("[OK] GET /api/v1/reports/me passed")

        # 6. Routing & Recalculation
        print("\n[6] Testing routing endpoints...")
        origin = {"lat": coords.lat, "lng": coords.lng}
        destination = {"lat": coords.lat + 0.01, "lng": coords.lng + 0.01}
        route_payload = {
            "origin": origin,
            "destination": destination,
            "profile_id": str(profile_id),
            "preferences": {"avoid_stairs": True}
        }
        resp = await client.post("/api/v1/routes/plan", json=route_payload, headers=headers)
        assert resp.status_code == 200, f"Plan route failed: {resp.text}"
        route_data = resp.json()["data"]
        routes = route_data["routes"]
        assert len(routes) > 0, "No routes returned"
        route_id = routes[0]["id"]
        print("[OK] POST /api/v1/routes/plan passed. Generated Route ID:", route_id)

        # Get route details
        resp = await client.get(f"/api/v1/routes/{route_id}", headers=headers)
        assert resp.status_code == 200, f"Get route failed: {resp.text}"
        print("[OK] GET /api/v1/routes/{id} details passed")

        # Route impact check
        resp = await client.post(f"/api/v1/routes/internal/{route_id}/impact", headers=headers)
        assert resp.status_code == 200, f"Route impact check failed: {resp.text}"
        print("[OK] POST /api/v1/routes/internal/{id}/impact passed:", resp.json()["data"])

        # Route recalculate
        resp = await client.post(f"/api/v1/routes/{route_id}/recalculate", headers=headers)
        assert resp.status_code == 200, f"Route recalculation failed: {resp.text}"
        print("[OK] POST /api/v1/routes/{id}/recalculate passed")

        # 7. Itineraries & Stops
        print("\n[7] Testing itinerary endpoints...")
        itinerary_payload = {
            "title": "Weekend city tour",
            "stops": [
                {"place_id": str(place_id), "sequence": 1, "notes": "Start of the tour"}
            ]
        }
        resp = await client.post("/api/v1/itineraries", json=itinerary_payload, headers=headers)
        assert resp.status_code == 200, f"Create itinerary failed: {resp.text}"
        itinerary_data = resp.json()["data"]
        itinerary_id = itinerary_data["id"]
        print("[OK] POST /api/v1/itineraries passed. Itinerary ID:", itinerary_id)

        # Get itinerary suitability check
        resp = await client.get(f"/api/v1/itineraries/{itinerary_id}/suitability", headers=headers)
        assert resp.status_code == 200, f"Itinerary suitability check failed: {resp.text}"
        print("[OK] GET /api/v1/itineraries/{id}/suitability passed:", resp.json()["data"])

        # 8. Context (Weather & Crowds)
        print("\n[8] Testing contextual endpoints...")
        # Weather
        resp = await client.get(f"/api/v1/context/weather?lat={coords.lat}&lng={coords.lng}", headers=headers)
        assert resp.status_code in (200, 404), f"Weather endpoint 500 error: {resp.text}"
        print(f"[OK] GET /api/v1/context/weather passed with status {resp.status_code}")

        # Crowds
        resp = await client.get(f"/api/v1/context/crowds?place_id={place_id}", headers=headers)
        assert resp.status_code in (200, 404), f"Crowds endpoint 500 error: {resp.text}"
        print(f"[OK] GET /api/v1/context/crowds passed with status {resp.status_code}")

        # 9. Auditor Workflow (Requires AUDITOR/ADMIN role)
        print("\n[9] Testing auditor workflow...")
        # Update current user role to AUDITOR so we can verify the report
        async with AsyncSessionLocal() as session:
            user_stmt = select(User).where(User.email == test_email)
            res = await session.execute(user_stmt)
            db_user = res.scalar_one()
            from app.models.enums import UserRole
            db_user.role = UserRole.AUDITOR
            await session.commit()

        # Auditor list reports
        resp = await client.get("/api/v1/auditor/reports?status=SUBMITTED", headers=headers)
        assert resp.status_code == 200, f"Auditor list reports failed: {resp.text}"
        print("[OK] GET /api/v1/auditor/reports passed, count:", len(resp.json()["data"]))

        # Auditor verify report
        verify_payload = {
            "action": "VERIFY",
            "reason": "Verified on-site by city officer."
        }
        resp = await client.post(f"/api/v1/auditor/reports/{report_id}/verify", json=verify_payload, headers=headers)
        assert resp.status_code == 200, f"Auditor verify report failed: {resp.text}"
        print("[OK] POST /api/v1/auditor/reports/{id}/verify passed")

    print("\n==================================================")
    print("ALL API LAYER INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
