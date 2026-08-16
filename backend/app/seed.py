"""
YatraSaathi — Deterministic demo/development database seeder.

This script populates the database with realistic demonstration data for India
(centered around Delhi heritage tourist spots) including spatial data, accessibility
profiles, barriers, reports, evidence, verification history, routes, weather, and crowd data.

It is repeatable and avoids duplicates by truncating tables before insertion.
"""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from geoalchemy2.elements import WKTElement
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models import (
    User,
    AccessibilityProfile,
    Place,
    Facility,
    AssistancePoint,
    AccessibilityRecord,
    Report,
    Barrier,
    Evidence,
    EvidenceObservation,
    Verification,
    RouteRequest,
    RouteConstraint,
    Route,
    RouteSegment,
    Itinerary,
    ItineraryStop,
    WeatherSnapshot,
    CrowdObservation,
    AuditLog,
    UserRole,
    RouteStyle,
    PlaceCategory,
    AccessibilityFeature,
    AccessibilityStatus,
    FacilityType,
    BarrierType,
    BarrierSeverity,
    BarrierStatus,
    ReportType,
    ReportStatus,
    VerificationAction,
    AssistanceType,
    AvailabilityStatus,
    SourceType,
    ConfidenceLevel,
    RecordStatus,
    ItineraryStatus,
    ItinerarySource,
    CrowdLevel,
)

# Reference coordinate: Delhi, India
# Delhi Monuments:
# 1. Qutub Minar (28.5244, 77.1855)
# 2. Red Fort (28.6562, 77.2410)
# 3. India Gate (28.6129, 77.2295)
# 4. Humayun's Tomb (28.5933, 77.2507)
# 5. Lotus Temple (28.5535, 77.2588)
# 6. National Museum (28.6118, 77.2191)
# 7. Connaught Place (28.6304, 77.2177)
# 8. Lodhi Gardens (28.5931, 77.2197)
# 9. Akshardham Temple (28.6127, 77.2773)
# 10. Jama Masjid (28.6507, 77.2334)


async def seed_data():
    print("Starting database seeding...")
    async with AsyncSessionLocal() as session:
        # 1. Clean existing seed/demo data by truncating tables in topological order
        # Since this is a dev/demo database, we clean up the tables to prevent uncontrolled duplicates.
        print("Cleaning existing database tables...")
        tables_to_clean = [
            "audit_logs",
            "verifications",
            "evidence_observations",
            "evidence",
            "route_segments",
            "routes",
            "route_constraints",
            "route_requests",
            "itinerary_stops",
            "itineraries",
            "barriers",
            "reports",
            "facilities",
            "assistance_points",
            "accessibility_records",
            "places",
            "accessibility_profiles",
            "users",
            "weather_snapshots",
            "crowd_observations",
        ]
        
        # Execute TRUNCATE CASCADE on all tables
        for table in tables_to_clean:
            await session.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;"))
        await session.commit()
        print("Database clean complete.")

        now_utc = datetime.now(timezone.utc)

        # ---------------------------------------------------------------------------
        # STAGE 3.1: Users and Accessibility Profiles (3 travellers + 1 auditor + 1 admin)
        # ---------------------------------------------------------------------------
        print("Seeding Users and Profiles...")
        
        users_data = [
            # Travellers
            {
                "id": uuid.uuid4(),
                "email": "aarav.wheelchair@demo.yatrasaathi.in",
                "display_name": "Aarav Sharma",
                "role": UserRole.TRAVELLER.value,
                "is_active": True,
                "profile": {
                    "mobility_preferences": {"wheelchair": True, "ramp_required": True},
                    "vision_preferences": {},
                    "hearing_preferences": {},
                    "cognitive_preferences": {},
                    "walking_limit_meters": 150,
                    "avoid_stairs": True,
                    "prefer_step_free": True,
                    "prefer_rest_stops": True,
                    "preferred_route_style": RouteStyle.MOST_ACCESSIBLE.value,
                }
            },
            {
                "id": uuid.uuid4(),
                "email": "diya.tactile@demo.yatrasaathi.in",
                "display_name": "Diya Patel",
                "role": UserRole.TRAVELLER.value,
                "is_active": True,
                "profile": {
                    "mobility_preferences": {},
                    "vision_preferences": {"tactile_paving": True, "audio_guide": True},
                    "hearing_preferences": {},
                    "cognitive_preferences": {},
                    "walking_limit_meters": 1000,
                    "avoid_stairs": False,
                    "prefer_step_free": False,
                    "prefer_rest_stops": False,
                    "preferred_route_style": RouteStyle.BALANCED.value,
                }
            },
            {
                "id": uuid.uuid4(),
                "email": "kabir.senior@demo.yatrasaathi.in",
                "display_name": "Kabir Banerjee (Senior)",
                "role": UserRole.TRAVELLER.value,
                "is_active": True,
                "profile": {
                    "mobility_preferences": {"slow_walking": True, "handrails_required": True},
                    "vision_preferences": {},
                    "hearing_preferences": {"low_noise": True},
                    "cognitive_preferences": {},
                    "walking_limit_meters": 300,
                    "avoid_stairs": True,
                    "prefer_step_free": True,
                    "prefer_rest_stops": True,
                    "preferred_route_style": RouteStyle.LEAST_WALKING.value,
                }
            },
            # Auditor / Authority / Admin
            {
                "id": uuid.uuid4(),
                "email": "amit.auditor@demo.yatrasaathi.in",
                "display_name": "Amit Kumar (Auditor)",
                "role": UserRole.AUDITOR.value,
                "is_active": True,
                "profile": None
            },
            {
                "id": uuid.uuid4(),
                "email": "admin@yatrasaathi.in",
                "display_name": "System Administrator",
                "role": UserRole.ADMIN.value,
                "is_active": True,
                "profile": None
            }
        ]

        users = {}
        for ud in users_data:
            user = User(
                id=ud["id"],
                email=ud["email"],
                display_name=ud["display_name"],
                role=ud["role"],
                is_active=ud["is_active"],
            )
            session.add(user)
            users[ud["email"]] = user
            
            if ud["profile"]:
                profile = AccessibilityProfile(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    mobility_preferences=ud["profile"]["mobility_preferences"],
                    vision_preferences=ud["profile"]["vision_preferences"],
                    hearing_preferences=ud["profile"]["hearing_preferences"],
                    cognitive_preferences=ud["profile"]["cognitive_preferences"],
                    walking_limit_meters=ud["profile"]["walking_limit_meters"],
                    avoid_stairs=ud["profile"]["avoid_stairs"],
                    prefer_step_free=ud["profile"]["prefer_step_free"],
                    prefer_rest_stops=ud["profile"]["prefer_rest_stops"],
                    preferred_route_style=ud["profile"]["preferred_route_style"],
                )
                session.add(profile)
        
        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.2: Places (10 places in Delhi heritage area)
        # ---------------------------------------------------------------------------
        print("Seeding Places...")
        places_data = [
            {
                "name": "Qutub Minar Complex",
                "description": "A UNESCO World Heritage Site with an ancient 73-meter brick minaret, surrounded by ruins. High level of step-free paths, but ruins have gravel surfaces.",
                "category": PlaceCategory.MONUMENT.value,
                "address": "Mehrauli, New Delhi",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.1855,
                "lat": 28.5244,
                "website_url": "https://www.delhitourism.gov.in/delhitourism/tourist_place/qutab_minar.jsp",
                "phone": "+91-11-24698422",
                "opening_hours": {"mon_sun": "07:00 - 17:00"},
            },
            {
                "name": "Red Fort (Lal Qila)",
                "description": "Historical fortification in Old Delhi. Main path from Lahori Gate is accessible; museums have ramps, but some heritage corridors contain steep steps.",
                "category": PlaceCategory.MONUMENT.value,
                "address": "Netaji Subhash Marg, Chandni Chowk",
                "city": "Old Delhi",
                "region": "Delhi",
                "lon": 77.2410,
                "lat": 28.6562,
                "website_url": "https://www.delhitourism.gov.in/delhitourism/tourist_place/red_fort.jsp",
                "phone": "+91-11-23277705",
                "opening_hours": {"tue_sun": "09:30 - 16:30", "mon": "closed"},
            },
            {
                "name": "India Gate",
                "description": "War memorial dedicated to troops of British India. Outer lawns are fully accessible, step-free paved pathways, high pedestrian traffic.",
                "category": PlaceCategory.PARK.value,
                "address": "Rajpath, Central Secretariat",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.2295,
                "lat": 28.6129,
                "website_url": "https://www.delhitourism.gov.in/delhitourism/tourist_place/india_gate.jsp",
                "phone": None,
                "opening_hours": {"mon_sun": "00:00 - 24:00"},
            },
            {
                "name": "Humayun's Tomb",
                "description": "First garden-tomb on the Indian subcontinent. Garden pathways are paved with sandstone and gravel; main tomb platform has steep staircases without ramp access.",
                "category": PlaceCategory.MONUMENT.value,
                "address": "Mathura Road, Nizamuddin",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.2507,
                "lat": 28.5933,
                "website_url": "https://www.delhitourism.gov.in/delhitourism/tourist_place/humayun_tomb.jsp",
                "phone": None,
                "opening_hours": {"mon_sun": "06:00 - 18:00"},
            },
            {
                "name": "Lotus Temple (Bahai House of Worship)",
                "description": "Flower-like temple notable for its architecture. High-quality smooth stone pathways lead to the main hall, with golf carts and wheelchair support available.",
                "category": PlaceCategory.TEMPLE.value,
                "address": "Kalkaji, New Delhi",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.2588,
                "lat": 28.5535,
                "website_url": "https://bahaihouseofworship.in",
                "phone": "+91-11-26470526",
                "opening_hours": {"tue_sun": "09:00 - 17:30", "mon": "closed"},
            },
            {
                "name": "National Museum",
                "description": "One of the largest museums in India. Fully equipped with elevators, ramp entrances, accessible toilets, and tactile pathways on the ground floor.",
                "category": PlaceCategory.MUSEUM.value,
                "address": "Janpath, Central Secretariat",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.2191,
                "lat": 28.6118,
                "website_url": "http://www.nationalmuseumindia.gov.in",
                "phone": "+91-11-23019272",
                "opening_hours": {"tue_fri": "10:00 - 18:00", "sat_sun": "10:00 - 20:00", "mon": "closed"},
            },
            {
                "name": "Connaught Place (CP)",
                "description": "A prominent business and commercial hub. Outer circle and inner circle corridors are generally step-free, but road crossings have steep curbs and broken tactile pavings.",
                "category": PlaceCategory.SHOP.value,
                "address": "Connaught Place",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.2177,
                "lat": 28.6304,
                "website_url": None,
                "phone": None,
                "opening_hours": {"mon_sun": "10:00 - 22:00"},
            },
            {
                "name": "Lodhi Gardens",
                "description": "City park containing tombs and heritage structures. Very popular for morning walks. Main trails are paved and smooth; minor trails are mud/gravel.",
                "category": PlaceCategory.PARK.value,
                "address": "Lodhi Road",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.2197,
                "lat": 28.5931,
                "website_url": None,
                "phone": None,
                "opening_hours": {"mon_sun": "06:00 - 20:00"},
            },
            {
                "name": "Akshardham Temple",
                "description": "Massive Hindu temple complex. Exceptionally high standard of accessibility. Golf carts, step-free access to all exhibitions, wheelchair ramps at all levels.",
                "category": PlaceCategory.TEMPLE.value,
                "address": "Noida Mor, Pandav Nagar",
                "city": "New Delhi",
                "region": "Delhi",
                "lon": 77.2773,
                "lat": 28.6127,
                "website_url": "https://akshardham.com",
                "phone": "+91-11-43440000",
                "opening_hours": {"tue_sun": "10:00 - 19:00", "mon": "closed"},
            },
            {
                "name": "Jama Masjid",
                "description": "One of the largest mosques in India. Reached via a large set of steep stone stairs on all sides. Exceptionally challenging for wheelchair users.",
                "category": PlaceCategory.TEMPLE.value,
                "address": "Chandni Chowk",
                "city": "Old Delhi",
                "region": "Delhi",
                "lon": 77.2334,
                "lat": 28.6507,
                "website_url": None,
                "phone": None,
                "opening_hours": {"mon_sun": "07:00 - 18:30"},
            }
        ]

        places = []
        for pd in places_data:
            place = Place(
                id=uuid.uuid4(),
                name=pd["name"],
                description=pd["description"],
                category=pd["category"],
                address=pd["address"],
                city=pd["city"],
                region=pd["region"],
                country="India",
                location=WKTElement(f"POINT({pd['lon']} {pd['lat']})", srid=4326),
                website_url=pd["website_url"],
                phone=pd["phone"],
                opening_hours=pd["opening_hours"],
                source_type=SourceType.DEMO.value,
                status=RecordStatus.ACTIVE.value,
            )
            session.add(place)
            places.append(place)

        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.3: Accessibility Records (30+ records: ~3 per place)
        # ---------------------------------------------------------------------------
        print("Seeding Accessibility Records...")
        accessibility_features = [
            (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Main entrance is ramped and step-free."),
            (AccessibilityFeature.ACCESSIBLE_TOILET.value, AccessibilityStatus.AVAILABLE.value, "Unisex wheelchair-accessible toilet near the entrance."),
            (AccessibilityFeature.ACCESSIBLE_PARKING.value, AccessibilityStatus.AVAILABLE.value, "Reserved wide parking spaces close to the ticket booth."),
            (AccessibilityFeature.TACTILE_GUIDANCE.value, AccessibilityStatus.UNAVAILABLE.value, "No tactile warning blocks on internal routes."),
            (AccessibilityFeature.REST_AREA.value, AccessibilityStatus.AVAILABLE.value, "Shaded benches placed at 50m intervals along paths."),
            (AccessibilityFeature.WHEELCHAIR_AVAILABLE.value, AccessibilityStatus.AVAILABLE.value, "Manual wheelchairs available on request at ticket counters."),
        ]

        accessibility_records = []
        for i, place in enumerate(places):
            # Select features based on place accessibility
            features_to_add = []
            if "Qutub Minar" in place.name:
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Ramp at Lahori Gate ticketing."),
                    (AccessibilityFeature.ACCESSIBLE_ROUTE.value, AccessibilityStatus.AVAILABLE.value, "Paved pathway covers 75% of the ruins."),
                    (AccessibilityFeature.ACCESSIBLE_TOILET.value, AccessibilityStatus.AVAILABLE.value, "Located near entrance, clean handrails."),
                    (AccessibilityFeature.TACTILE_GUIDANCE.value, AccessibilityStatus.UNAVAILABLE.value, "No braille/tactile pavings."),
                ]
            elif "Red Fort" in place.name:
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Wooden ramp over stone threshold at Lahori Gate."),
                    (AccessibilityFeature.ACCESSIBLE_ROUTE.value, AccessibilityStatus.TEMPORARILY_UNAVAILABLE.value, "Chhatta Chowk corridor is undergoing maintenance, pathways are uneven."),
                    (AccessibilityFeature.WHEELCHAIR_AVAILABLE.value, AccessibilityStatus.AVAILABLE.value, "Available at the gate, request from guard."),
                ]
            elif "India Gate" in place.name:
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Fully open lawns, ramped curbs on all entry points."),
                    (AccessibilityFeature.ACCESSIBLE_ROUTE.value, AccessibilityStatus.AVAILABLE.value, "Wide concrete sidewalks, excellent surface quality."),
                    (AccessibilityFeature.REST_AREA.value, AccessibilityStatus.AVAILABLE.value, "Many park benches, though heavily crowded in the evening."),
                    (AccessibilityFeature.ACCESSIBLE_TOILET.value, AccessibilityStatus.UNAVAILABLE.value, "Public toilet cabins have steps and narrow doors."),
                ]
            elif "National Museum" in place.name:
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Ramped main entrance on Janpath."),
                    (AccessibilityFeature.ELEVATOR.value, AccessibilityStatus.AVAILABLE.value, "Elevator to 1st and 2nd floor galleries, fully operational."),
                    (AccessibilityFeature.ACCESSIBLE_TOILET.value, AccessibilityStatus.AVAILABLE.value, "Large stalls, grab bars present."),
                    (AccessibilityFeature.TACTILE_GUIDANCE.value, AccessibilityStatus.AVAILABLE.value, "Yellow warning paths present on the ground floor."),
                ]
            elif "Lotus Temple" in place.name:
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Golf carts assist elderly/disabled visitors from the parking to the gate."),
                    (AccessibilityFeature.ACCESSIBLE_ROUTE.value, AccessibilityStatus.AVAILABLE.value, "Smooth, wide marble pathways with step-free bypasses."),
                    (AccessibilityFeature.WHEELCHAIR_AVAILABLE.value, AccessibilityStatus.AVAILABLE.value, "Free wheelchair loan service at visitor center."),
                    (AccessibilityFeature.TACTILE_GUIDANCE.value, AccessibilityStatus.UNAVAILABLE.value, "Tactile path only exists at the main security check."),
                ]
            elif "Akshardham" in place.name:
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Excellent wide ramps with anti-slip grooves."),
                    (AccessibilityFeature.ACCESSIBLE_ROUTE.value, AccessibilityStatus.AVAILABLE.value, "Perfectly smooth, step-free access to all exhibition halls."),
                    (AccessibilityFeature.ELEVATOR.value, AccessibilityStatus.AVAILABLE.value, "Lifts present to take users to temple podium."),
                    (AccessibilityFeature.ACCESSIBLE_TOILET.value, AccessibilityStatus.AVAILABLE.value, "Equipped with state-of-the-art accessible stalls."),
                ]
            elif "Jama Masjid" in place.name:
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.UNAVAILABLE.value, "All gates have steep 30+ stone steps with no ramp options."),
                    (AccessibilityFeature.ACCESSIBLE_ROUTE.value, AccessibilityStatus.UNAVAILABLE.value, "Courtyard has high thresholds, red sandstone gets extremely hot."),
                    (AccessibilityFeature.ACCESSIBLE_TOILET.value, AccessibilityStatus.UNAVAILABLE.value, "Traditional washing area only, no wheelchair-accessible stalls."),
                ]
            else:
                # Default features for other places to reach 30+ records
                features_to_add = [
                    (AccessibilityFeature.STEP_FREE_ENTRANCE.value, AccessibilityStatus.AVAILABLE.value, "Wheelchair ramp at side gate."),
                    (AccessibilityFeature.ACCESSIBLE_PARKING.value, AccessibilityStatus.AVAILABLE.value, "Marked bays near entrance."),
                    (AccessibilityFeature.REST_AREA.value, AccessibilityStatus.AVAILABLE.value, "Benches available in shade."),
                ]

            for feature, status, desc in features_to_add:
                rec = AccessibilityRecord(
                    id=uuid.uuid4(),
                    place_id=place.id,
                    feature=feature,
                    status=status,
                    description=f"{place.name}: {desc}",
                    confidence=ConfidenceLevel.HIGH.value if i % 2 == 0 else ConfidenceLevel.MEDIUM.value,
                    source_type=SourceType.DEMO.value,
                    last_verified_at=now_utc - timedelta(days=10),
                    expires_at=now_utc + timedelta(days=90),
                )
                session.add(rec)
                accessibility_records.append(rec)
        
        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.4: Assistance Points (5+ points)
        # ---------------------------------------------------------------------------
        print("Seeding Assistance Points...")
        assistance_data = [
            {
                "place_idx": 0, # Qutub Minar
                "name": "Qutub Minar Main Help Desk",
                "assistance_type": AssistanceType.INFORMATION_DESK.value,
                "description": "Assistance desk for entry ticket waiver and booking wheelchairs or golf carts.",
                "lon": 77.1853, "lat": 28.5242
            },
            {
                "place_idx": 1, # Red Fort
                "name": "Red Fort Tourist Assistance booth",
                "assistance_type": AssistanceType.GUIDE_SUPPORT.value,
                "description": "Guides trained in sign language and mobility support are available here.",
                "lon": 77.2408, "lat": 28.6560
            },
            {
                "place_idx": 4, # Lotus Temple
                "name": "Lotus Temple Mobility Help Station",
                "assistance_type": AssistanceType.WHEELCHAIR_SUPPORT.value,
                "description": "Provides manual wheelchairs and volunteers to push wheelchairs up the marble ramp.",
                "lon": 77.2586, "lat": 28.5533
            },
            {
                "place_idx": 5, # National Museum
                "name": "Museum Audio Guide counter",
                "assistance_type": AssistanceType.HEARING_SUPPORT.value,
                "description": "Provides specialized audio guides and braille map brochures.",
                "lon": 77.2190, "lat": 28.6116
            },
            {
                "place_idx": 8, # Akshardham
                "name": "Akshardham Divyangjan Support Desk",
                "assistance_type": AssistanceType.WHEELCHAIR_SUPPORT.value,
                "description": "Full concierge support for disabled travellers, including free golf cart transfers.",
                "lon": 77.2770, "lat": 28.6125
            }
        ]

        assistance_points = []
        for ad in assistance_data:
            place = places[ad["place_idx"]]
            ap = AssistancePoint(
                id=uuid.uuid4(),
                place_id=place.id,
                name=ad["name"],
                assistance_type=ad["assistance_type"],
                description=ad["description"],
                location=WKTElement(f"POINT({ad['lon']} {ad['lat']})", srid=4326),
                availability_status=AvailabilityStatus.AVAILABLE.value,
                source_type=SourceType.DEMO.value,
                last_verified_at=now_utc - timedelta(days=2),
            )
            session.add(ap)
            assistance_points.append(ap)
            
        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.5: Barriers and Reports (8+ barriers, 10+ evidence, 10+ reports)
        # ---------------------------------------------------------------------------
        print("Seeding Barriers and Reports...")
        
        # Reports
        reports_data = [
            {
                "email": "aarav.wheelchair@demo.yatrasaathi.in",
                "place_idx": 0, # Qutub Minar
                "report_type": ReportType.BARRIER.value,
                "title": "Broken elevator ramp to Qutub minaret pathway",
                "description": "The iron ramp leading to the central paved trail has collapsed and is completely unusable by wheelchair users. A bypass requires going through deep mud.",
                "lon": 77.1856, "lat": 28.5245
            },
            {
                "email": "diya.tactile@demo.yatrasaathi.in",
                "place_idx": 6, # Connaught Place
                "report_type": ReportType.BARRIER.value,
                "title": "Blocked tactile pathway near Block A CP",
                "description": "Street vendors have set up heavy metal stalls directly on top of the yellow tactile guidance line, blocking blind users.",
                "lon": 77.2178, "lat": 28.6305
            },
            {
                "email": "kabir.senior@demo.yatrasaathi.in",
                "place_idx": 7, # Lodhi Gardens
                "report_type": ReportType.BARRIER.value,
                "title": "Broken stairs near Tomb entrance",
                "description": "Steps have cracked and loose stones are scattered around, making it a high trip hazard for seniors.",
                "lon": 77.2198, "lat": 28.5932
            },
            {
                "email": "aarav.wheelchair@demo.yatrasaathi.in",
                "place_idx": 1, # Red Fort
                "report_type": ReportType.BARRIER.value,
                "title": "Construction scaffolding blocking Mumtaz Mahal ramp",
                "description": "Heavy scaffolding pipes have been stacked on the museum entry ramp, blocking entry.",
                "lon": 77.2412, "lat": 28.6564
            },
            {
                "email": "diya.tactile@demo.yatrasaathi.in",
                "place_idx": 3, # Humayun's tomb
                "report_type": ReportType.BARRIER.value,
                "title": "Loose gravel on Humayun South Gate route",
                "description": "Very thick layer of loose gravel makes pushing wheelchairs impossible and is highly slippery for blind people using canes.",
                "lon": 77.2509, "lat": 28.5935
            },
            {
                "email": "kabir.senior@demo.yatrasaathi.in",
                "place_idx": 2, # India Gate
                "report_type": ReportType.BARRIER.value,
                "title": "Broken water puddle on main walkway",
                "description": "Water logging from broken pipe covers the step-free path, forced to step on high curbs to bypass.",
                "lon": 77.2297, "lat": 28.6131
            },
            {
                "email": "aarav.wheelchair@demo.yatrasaathi.in",
                "place_idx": 9, # Jama Masjid
                "report_type": ReportType.BARRIER.value,
                "title": "Debris blocking North Gate entrance steps",
                "description": "Trash, construction debris and vendors block the entry corridor completely.",
                "lon": 77.2336, "lat": 28.6509
            },
            {
                "email": "diya.tactile@demo.yatrasaathi.in",
                "place_idx": 0, # Qutub Minar
                "report_type": ReportType.BARRIER.value,
                "title": "Missing warning tile at tomb stairs",
                "description": "The warning tactile tiles at the top of the stairs have eroded completely.",
                "lon": 77.1854, "lat": 28.5243
            }
        ]

        reports = []
        barriers = []
        evidences = []
        verifications = []

        for idx, rd in enumerate(reports_data):
            user = users[rd["email"]]
            place = places[rd["place_idx"]]
            
            # Create report
            report = Report(
                id=uuid.uuid4(),
                user_id=user.id,
                place_id=place.id,
                report_type=rd["report_type"],
                title=rd["title"],
                description=rd["description"],
                location=WKTElement(f"POINT({rd['lon']} {rd['lat']})", srid=4326),
                status=ReportStatus.VERIFIED.value if idx < 6 else ReportStatus.SUBMITTED.value,
            )
            session.add(report)
            reports.append(report)
            await session.flush()

            # Create Barrier (only for verified or active reports, representing Stage 3's 8+ barriers)
            # Map report to barrier
            barrier_status = BarrierStatus.ACTIVE.value if idx < 6 else BarrierStatus.SUBMITTED.value
            barrier = Barrier(
                id=uuid.uuid4(),
                place_id=place.id,
                reported_by=user.id,
                report_id=report.id,
                barrier_type=BarrierType.BLOCKED_PATH.value if idx % 2 == 0 else BarrierType.CONSTRUCTION.value,
                title=rd["title"],
                description=rd["description"],
                severity=BarrierSeverity.HIGH.value if idx % 3 == 0 else BarrierSeverity.MEDIUM.value,
                location=WKTElement(f"POINT({rd['lon']} {rd['lat']})", srid=4326),
                status=barrier_status,
                observed_at=now_utc - timedelta(hours=12),
                reported_at=now_utc - timedelta(hours=10),
                verified_at=now_utc - timedelta(hours=8) if idx < 6 else None,
                expires_at=(
                    now_utc - timedelta(days=1) if idx == 0
                    else now_utc + timedelta(days=2) if idx % 2 == 0
                    else None
                ),
            )
            session.add(barrier)
            barriers.append(barrier)
            await session.flush()

            # Create Evidence for each barrier (Stage 3 requires 10+ evidence records)
            evidence = Evidence(
                id=uuid.uuid4(),
                report_id=report.id,
                barrier_id=barrier.id,
                uploaded_by=user.id,
                storage_key=f"evidence/demo_barrier_{idx}.jpg",
                original_filename=f"photo_{idx}.jpg",
                mime_type="image/jpeg",
                file_size_bytes=1024 * 500, # 500 KB
                sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                ai_analysis={
                    "detected_objects": ["barrier", "blockage", "construction"],
                    "accessibility_issues": ["step", "uneven_surface"]
                },
                ai_confidence=Decimal("0.9250"),
            )
            session.add(evidence)
            evidences.append(evidence)
            await session.flush()

            # Create Evidence Observation (AI observation)
            obs = EvidenceObservation(
                id=uuid.uuid4(),
                evidence_id=evidence.id,
                model_name="YatraSaathi-VLM-v1",
                observation_type="PATH_BLOCKAGE",
                observation=f"Confirmed high probability of pathway blockage due to {rd['title']}",
                confidence=Decimal("0.9400"),
            )
            session.add(obs)

            # Create Verification history (only for verified barriers)
            if idx < 6:
                verifier = users["amit.auditor@demo.yatrasaathi.in"]
                verification = Verification(
                    id=uuid.uuid4(),
                    report_id=report.id,
                    barrier_id=barrier.id,
                    verified_by=verifier.id,
                    action=VerificationAction.VERIFY.value,
                    reason=f"Verified the barrier on-site. {rd['title']} is active and blocking access.",
                    previous_status=BarrierStatus.SUBMITTED.value,
                    new_status=BarrierStatus.ACTIVE.value,
                )
                session.add(verification)
                verifications.append(verification)

        # Add 2 more reports with no barriers to hit 10+ reports
        for i in range(2):
            user = users["kabir.senior@demo.yatrasaathi.in"]
            place = places[4] # Lotus Temple
            report = Report(
                id=uuid.uuid4(),
                user_id=user.id,
                place_id=place.id,
                report_type=ReportType.FACILITY_CHANGE.value,
                title=f"Facility suggestion {i+1} at Lotus Temple",
                description="Suggest adding warning tactiles near entrance steps.",
                location=WKTElement("POINT(77.2588 28.5535)", srid=4326),
                status=ReportStatus.SUBMITTED.value,
            )
            session.add(report)
            reports.append(report)
            
            await session.flush()
            
            # Evidence for these extra reports
            evidence = Evidence(
                id=uuid.uuid4(),
                report_id=report.id,
                barrier_id=None,
                uploaded_by=user.id,
                storage_key=f"evidence/demo_report_{i}.jpg",
                original_filename=f"suggestion_{i}.jpg",
                mime_type="image/jpeg",
                file_size_bytes=1024 * 120,
                sha256_hash="f3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                ai_analysis={"detected_objects": ["steps", "temple"]},
                ai_confidence=Decimal("0.8500"),
            )
            session.add(evidence)
            evidences.append(evidence)

        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.6: Route Scenarios (5 route requests, routes, segments, constraints)
        # ---------------------------------------------------------------------------
        print("Seeding Route Scenarios...")
        # Delhi route requests
        # Route 1: Connaught Place -> India Gate (Central Delhi)
        # Route 2: Lodhi Gardens -> Humayun's Tomb
        # Route 3: Qutub Minar -> Lotus Temple
        # Route 4: Red Fort -> Jama Masjid
        # Route 5: National Museum -> Connaught Place
        scenarios = [
            {
                "user": "aarav.wheelchair@demo.yatrasaathi.in",
                "origin": (77.2177, 28.6304), # CP
                "destination": (77.2295, 28.6129), # India Gate
                "constraints": [("AVOID_STAIRS", True), ("PREFER_STEP_FREE", True)],
                "routes": [
                    {
                        "provider": "google_maps",
                        "distance": 3200.50,
                        "duration": 900,
                        "score": 85.50,
                        "barrier_count": 0,
                        "confidence": ConfidenceLevel.HIGH.value,
                        "geometry": "LINESTRING(77.2177 28.6304, 77.2215 28.6255, 77.2295 28.6129)",
                        "segments": [
                            {"seq": 0, "dist": 1500.0, "dur": 450, "surface": "asphalt", "stairs": 0, "status": AccessibilityStatus.AVAILABLE.value, "geometry": "LINESTRING(77.2177 28.6304, 77.2215 28.6255)"},
                            {"seq": 1, "dist": 1700.5, "dur": 450, "surface": "concrete", "stairs": 0, "status": AccessibilityStatus.AVAILABLE.value, "geometry": "LINESTRING(77.2215 28.6255, 77.2295 28.6129)"}
                        ]
                    }
                ]
            },
            {
                "user": "diya.tactile@demo.yatrasaathi.in",
                "origin": (77.2197, 28.5931), # Lodhi Gardens
                "destination": (77.2507, 28.5933), # Humayun's Tomb
                "constraints": [("TACTILE_GUIDANCE_REQUIRED", True)],
                "routes": [
                    {
                        "provider": "open_route_service",
                        "distance": 3800.00,
                        "duration": 1200,
                        "score": 60.00,
                        "barrier_count": 1,
                        "confidence": ConfidenceLevel.MEDIUM.value,
                        "geometry": "LINESTRING(77.2197 28.5931, 77.2350 28.5920, 77.2507 28.5933)",
                        "segments": [
                            {"seq": 0, "dist": 2000.0, "dur": 600, "surface": "tiles", "stairs": 0, "status": AccessibilityStatus.AVAILABLE.value, "geometry": "LINESTRING(77.2197 28.5931, 77.2350 28.5920)"},
                            {"seq": 1, "dist": 1800.0, "dur": 600, "surface": "gravel", "stairs": 4, "status": AccessibilityStatus.UNAVAILABLE.value, "geometry": "LINESTRING(77.2350 28.5920, 77.2507 28.5933)"}
                        ]
                    }
                ]
            },
            {
                "user": "kabir.senior@demo.yatrasaathi.in",
                "origin": (77.1855, 28.5244), # Qutub Minar
                "destination": (77.2588, 28.5535), # Lotus Temple
                "constraints": [("MAX_WALKING_DISTANCE", {"limit": 400})],
                "routes": [
                    {
                        "provider": "demo",
                        "distance": 8500.00,
                        "duration": 1800,
                        "score": 75.00,
                        "barrier_count": 1,
                        "confidence": ConfidenceLevel.HIGH.value,
                        "geometry": "LINESTRING(77.1855 28.5244, 77.2200 28.5300, 77.2588 28.5535)",
                        "segments": [
                            {"seq": 0, "dist": 4000.0, "dur": 900, "surface": "paved", "stairs": 0, "status": AccessibilityStatus.AVAILABLE.value, "geometry": "LINESTRING(77.1855 28.5244, 77.2200 28.5300)"},
                            {"seq": 1, "dist": 4500.0, "dur": 900, "surface": "paved", "stairs": 2, "status": AccessibilityStatus.TEMPORARILY_UNAVAILABLE.value, "geometry": "LINESTRING(77.2200 28.5300, 77.2588 28.5535)"}
                        ]
                    }
                ]
            },
            {
                "user": "aarav.wheelchair@demo.yatrasaathi.in",
                "origin": (77.2410, 28.6562), # Red Fort
                "destination": (77.2334, 28.6507), # Jama Masjid
                "constraints": [("AVOID_STAIRS", True)],
                "routes": [
                    {
                        "provider": "google_maps",
                        "distance": 1200.00,
                        "duration": 500,
                        "score": 30.00,
                        "barrier_count": 2,
                        "confidence": ConfidenceLevel.LOW.value,
                        "geometry": "LINESTRING(77.2410 28.6562, 77.2360 28.6530, 77.2334 28.6507)",
                        "segments": [
                            {"seq": 0, "dist": 600.0, "dur": 250, "surface": "asphalt", "stairs": 12, "status": AccessibilityStatus.TEMPORARILY_UNAVAILABLE.value, "geometry": "LINESTRING(77.2410 28.6562, 77.2360 28.6530)"},
                            {"seq": 1, "dist": 600.0, "dur": 250, "surface": "concrete", "stairs": 25, "status": AccessibilityStatus.UNAVAILABLE.value, "geometry": "LINESTRING(77.2360 28.6530, 77.2334 28.6507)"}
                        ]
                    }
                ]
            },
            {
                "user": "diya.tactile@demo.yatrasaathi.in",
                "origin": (77.2191, 28.6118), # National Museum
                "destination": (77.2177, 28.6304), # Connaught Place
                "constraints": [("PREFER_REST_STOPS", True)],
                "routes": [
                    {
                        "provider": "demo",
                        "distance": 2200.00,
                        "duration": 700,
                        "score": 90.00,
                        "barrier_count": 0,
                        "confidence": ConfidenceLevel.HIGH.value,
                        "geometry": "LINESTRING(77.2191 28.6118, 77.2185 28.6200, 77.2177 28.6304)",
                        "segments": [
                            {"seq": 0, "dist": 1100.0, "dur": 350, "surface": "tiles", "stairs": 0, "status": AccessibilityStatus.AVAILABLE.value, "geometry": "LINESTRING(77.2191 28.6118, 77.2185 28.6200)"},
                            {"seq": 1, "dist": 1100.0, "dur": 350, "surface": "tiles", "stairs": 0, "status": AccessibilityStatus.AVAILABLE.value, "geometry": "LINESTRING(77.2185 28.6200, 77.2177 28.6304)"}
                        ]
                    }
                ]
            }
        ]

        for s_idx, sc in enumerate(scenarios):
            user = users[sc["user"]]
            prof = await session.execute(
                text("SELECT id FROM accessibility_profiles WHERE user_id = :uid"), {"uid": user.id}
            )
            prof_id = prof.scalar()

            # Create RouteRequest
            req = RouteRequest(
                id=uuid.uuid4(),
                user_id=user.id,
                profile_id=prof_id,
                origin=WKTElement(f"POINT({sc['origin'][0]} {sc['origin'][1]})", srid=4326),
                destination=WKTElement(f"POINT({sc['destination'][0]} {sc['destination'][1]})", srid=4326),
                preferences={"style": "accessible"},
                requested_at=now_utc - timedelta(days=s_idx),
            )
            session.add(req)
            await session.flush()

            # Create RouteConstraints
            for c_idx, (ctype, val) in enumerate(sc["constraints"]):
                constraint = RouteConstraint(
                    id=uuid.uuid4(),
                    route_request_id=req.id,
                    constraint_type=ctype,
                    value={"option": val} if isinstance(val, bool) else val,
                    priority=c_idx,
                )
                session.add(constraint)

            # Create Routes & Segments
            for rc in sc["routes"]:
                route = Route(
                    id=uuid.uuid4(),
                    route_request_id=req.id,
                    provider=rc["provider"],
                    provider_route_id=f"proute_{s_idx}",
                    geometry=WKTElement(rc["geometry"], srid=4326),
                    distance_meters=Decimal(str(rc["distance"])),
                    duration_seconds=rc["duration"],
                    accessibility_score=Decimal(str(rc["score"])),
                    walking_distance_meters=Decimal(str(rc["distance"])),
                    stairs_count=sum(seg["stairs"] for seg in rc["segments"]),
                    barrier_count=rc["barrier_count"],
                    confidence=rc["confidence"],
                    ranking_reason={"score_evaluation": "calculated_by_weights"},
                )
                session.add(route)
                await session.flush()

                for seg in rc["segments"]:
                    segment = RouteSegment(
                        id=uuid.uuid4(),
                        route_id=route.id,
                        sequence=seg["seq"],
                        geometry=WKTElement(seg["geometry"], srid=4326),
                        distance_meters=Decimal(str(seg["dist"])),
                        duration_seconds=seg["dur"],
                        surface_type=seg["surface"],
                        stairs_count=seg["stairs"],
                        accessibility_status=seg["status"],
                        barrier_count=1 if seg["status"] != AccessibilityStatus.AVAILABLE.value else 0,
                        extra_data={"routing_notes": "smooth surface"},
                    )
                    session.add(segment)

        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.7: Itineraries (Multi-stop travel plans)
        # ---------------------------------------------------------------------------
        print("Seeding Itineraries...")
        # Aarav's Day Out
        itinerary = Itinerary(
            id=uuid.uuid4(),
            user_id=users["aarav.wheelchair@demo.yatrasaathi.in"].id,
            title="Aarav's Delhi Heritage Tour",
            start_time=now_utc + timedelta(days=1),
            end_time=now_utc + timedelta(days=1, hours=8),
            status=ItineraryStatus.ACTIVE.value,
            generated_by=ItinerarySource.AI_GENERATED.value,
        )
        session.add(itinerary)
        await session.flush()

        # Stops: Qutub Minar -> Lotus Temple -> Akshardham
        stops = [places[0], places[4], places[8]]
        for seq, place in enumerate(stops):
            stop = ItineraryStop(
                id=uuid.uuid4(),
                itinerary_id=itinerary.id,
                place_id=place.id,
                sequence=seq,
                planned_start=now_utc + timedelta(days=1, hours=seq * 3),
                planned_end=now_utc + timedelta(days=1, hours=seq * 3 + 2),
                notes=f"Visit stop {seq} at {place.name}",
                accessibility_snapshot={
                    "step_free": True,
                    "assistive_staff_available": True,
                    "scouted_barrier_count": 0 if "Akshardham" in place.name else 1
                }
            )
            session.add(stop)

        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.8: Weather Snapshots & Crowd Observations
        # ---------------------------------------------------------------------------
        print("Seeding Weather & Crowd...")
        # Weather for all places
        for place in places:
            # Weather
            weather = WeatherSnapshot(
                id=uuid.uuid4(),
                location=place.location,
                provider="India Meteorological Department",
                condition="Sunny" if place.name != "Lotus Temple" else "Partly Cloudy",
                temperature_c=Decimal("32.50"),
                rain_probability=Decimal("0.1000"),
                wind_speed_kph=Decimal("12.50"),
                observed_at=now_utc,
                expires_at=now_utc + timedelta(hours=3),
                raw_metadata={"humidity": 65, "uv_index": 8},
            )
            session.add(weather)

            # Crowd
            crowd = CrowdObservation(
                id=uuid.uuid4(),
                place_id=place.id,
                crowd_level=CrowdLevel.HIGH.value if "India Gate" in place.name or "Lal Qila" in place.name else CrowdLevel.MODERATE.value,
                source_type=SourceType.AI_ASSISTED.value,
                confidence=ConfidenceLevel.HIGH.value,
                observed_at=now_utc - timedelta(minutes=15),
                expires_at=now_utc + timedelta(hours=1),
                extra_data={"camera_feed_analyzed": True, "pedestrian_count": 120},
            )
            session.add(crowd)

        await session.flush()

        # ---------------------------------------------------------------------------
        # STAGE 3.9: Audit Logs (Track actions taken)
        # ---------------------------------------------------------------------------
        print("Seeding Audit Logs...")
        audit_logs = [
            AuditLog(
                id=uuid.uuid4(),
                actor_user_id=users["admin@yatrasaathi.in"].id,
                action="SYSTEM_INIT",
                entity_type="SYSTEM",
                entity_id=None,
                extra_data={"event": "Database system bootstrapped with demo seed datasets."},
                created_at=now_utc - timedelta(hours=24),
            ),
            AuditLog(
                id=uuid.uuid4(),
                actor_user_id=users["amit.auditor@demo.yatrasaathi.in"].id,
                action="BARRIER_VERIFY",
                entity_type="Barrier",
                entity_id=barriers[0].id,
                extra_data={"auditor_notes": "Confirmed broken ramp at Qutub Minar."},
                created_at=now_utc - timedelta(hours=8),
            )
        ]
        for log in audit_logs:
            session.add(log)

        await session.commit()
        print("Database transaction committed successfully!")

        # Verify Counts
        print("\n==================================================")
        print("SEEDING SUMMARY (DEMO & DEVELOPMENT DATA)")
        print("==================================================")
        print(f"Users created: {len(users_data)}")
        print(f"Places created: {len(places_data)}")
        print(f"Accessibility Records created: {len(accessibility_records)}")
        print(f"Assistance Points created: {len(assistance_points)}")
        print(f"Reports created: {len(reports)}")
        print(f"Barriers created: {len(barriers)}")
        print(f"Evidence files created: {len(evidences)}")
        print(f"Verification logs created: {len(verifications)}")
        print(f"Route requests created: {len(scenarios)}")
        print(f"Itineraries created: 1")
        print(f"Weather & Crowd records created: {len(places_data)} each")
        print("==================================================\n")
        print("Database seeding completed successfully and verified.")


if __name__ == "__main__":
    asyncio.run(seed_data())
