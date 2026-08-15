# AccessPath --- System Architecture

**Project:** S20 --- Accessible Journey Planner with Real-Time Barrier
and Assistance Mapping\
**Document:** Architecture Specification\
**Version:** 1.0\
**Depends On:** `docs/PRD.md`

------------------------------------------------------------------------

# 1. Architecture Goals

The architecture must:

1.  Directly satisfy S20 requirements.
2.  Keep the core accessibility engine independent from the AI layer.
3.  Allow text and voice to use the same AI/tool system.
4.  Support evidence, verification, freshness, and confidence.
5.  Support dynamic barriers that can change route recommendations.
6.  Allow S21/S22 capabilities to be added later without rewriting S20.
7.  Be practical for a small/student development team.
8.  Keep secrets and privileged operations on the server.
9.  Allow external services to fail gracefully.
10. Make the system easy for AI coding agents to understand and modify.

------------------------------------------------------------------------

# 2. High-Level Architecture

``` text
                              ┌──────────────────────┐
                              │        USER          │
                              └──────────┬───────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
              TEXT / WEB                                  VOICE
                    │                                         │
                    ▼                                         ▼
            ┌───────────────┐                         ┌───────────────┐
            │   Next.js UI  │                         │ LiveKit Agent │
            │ TypeScript    │                         │ Voice Layer   │
            └───────┬───────┘                         └───────┬───────┘
                    │                                         │
                    └────────────────┬────────────────────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │    FastAPI API    │
                           │  Auth + Business  │
                           │      Logic        │
                           └─────────┬─────────┘
                                     │
          ┌──────────────────────────┼─────────────────────────┐
          │                          │                         │
          ▼                          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│ Accessibility    │      │ Route & Journey  │      │ AI Copilot       │
│ Engine           │      │ Engine           │      │ + Tool Layer     │
└────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ PostgreSQL +       │
                         │ PostGIS             │
                         └─────────┬──────────┘
                                   │
             ┌─────────────────────┼──────────────────────┐
             │                     │                      │
             ▼                     ▼                      ▼
       Maps / Routing           Weather             File Storage
       OpenStreetMap             API                 Evidence
```

------------------------------------------------------------------------

# 3. Architectural Layers

The system is divided into seven logical layers.

## Layer 1 --- Presentation

Responsible for:

-   web UI;
-   map;
-   accessibility controls;
-   itinerary;
-   AI chat;
-   voice controls;
-   reports;
-   auditor dashboards.

Technology:

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   MapLibre GL JS

------------------------------------------------------------------------

## Layer 2 --- API / Application

Responsible for:

-   authentication;
-   authorization;
-   request validation;
-   API routing;
-   business workflows;
-   orchestration;
-   rate limiting;
-   error handling.

Technology:

-   FastAPI
-   Pydantic
-   Python

------------------------------------------------------------------------

## Layer 3 --- Domain Engines

Contains business logic that should not depend on a specific AI
provider.

### Accessibility Engine

Calculates traveller/place compatibility.

### Route Engine

Generates and evaluates route alternatives.

### Barrier Engine

Handles temporary accessibility conditions.

### Trust Engine

Calculates/represents confidence, freshness, and verification state.

### Itinerary Engine

Builds multi-stop plans.

------------------------------------------------------------------------

## Layer 4 --- AI Layer

The AI Copilot:

-   understands natural language;
-   selects tools;
-   interprets structured results;
-   generates explanations;
-   creates itineraries;
-   asks clarification questions when necessary.

The AI must not directly manipulate the database.

It accesses application functionality through approved tools.

------------------------------------------------------------------------

## Layer 5 --- Data Layer

Primary database:

-   PostgreSQL
-   PostGIS

Stores:

-   users;
-   profiles;
-   places;
-   facilities;
-   barriers;
-   evidence metadata;
-   verification;
-   routes;
-   itinerary data;
-   weather snapshots;
-   crowd reports;
-   audit logs.

------------------------------------------------------------------------

## Layer 6 --- External Services

Potential services:

-   OpenStreetMap;
-   routing provider;
-   weather provider;
-   geocoding;
-   object storage;
-   AI provider;
-   STT;
-   TTS;
-   LiveKit.

External services must be wrapped by internal adapters so providers can
be replaced later.

------------------------------------------------------------------------

## Layer 7 --- Observability and Security

Includes:

-   application logs;
-   audit logs;
-   error tracking;
-   request IDs;
-   authentication;
-   authorization;
-   rate limiting;
-   input validation;
-   file validation.

------------------------------------------------------------------------

# 4. Frontend Architecture

Recommended structure:

``` text
frontend/
├── app/
│   ├── (marketing)/
│   ├── auth/
│   ├── onboarding/
│   ├── dashboard/
│   ├── destinations/
│   ├── routes/
│   ├── itinerary/
│   ├── copilot/
│   ├── report/
│   ├── auditor/
│   └── settings/
│
├── components/
│   ├── accessibility/
│   ├── map/
│   ├── route/
│   ├── destination/
│   ├── copilot/
│   ├── voice/
│   ├── reports/
│   ├── trust/
│   ├── forms/
│   └── ui/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── maps/
│   ├── accessibility/
│   └── utils/
│
├── hooks/
├── types/
└── styles/
```

The frontend should communicate with the backend through typed API
clients.

------------------------------------------------------------------------

# 5. Backend Architecture

Recommended structure:

``` text
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── profiles.py
│   │   ├── places.py
│   │   ├── routes.py
│   │   ├── barriers.py
│   │   ├── evidence.py
│   │   ├── itinerary.py
│   │   ├── copilot.py
│   │   ├── weather.py
│   │   └── auditor.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   └── errors.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── accessibility/
│   │   ├── routing/
│   │   ├── barriers/
│   │   ├── trust/
│   │   ├── itinerary/
│   │   └── weather/
│   │
│   ├── integrations/
│   │   ├── maps/
│   │   ├── weather/
│   │   ├── geocoding/
│   │   ├── storage/
│   │   └── ai/
│   │
│   └── db/
│       ├── session.py
│       ├── migrations/
│       └── seed/
│
└── tests/
```

------------------------------------------------------------------------

# 6. AI Architecture

The AI must sit above the application tools.

``` text
User Request
     │
     ▼
AI Copilot
     │
     ├── Understand intent
     │
     ├── Read traveller preferences
     │
     ├── Select tools
     │
     ▼
Tool Layer
     │
     ├── search_places
     ├── get_accessibility
     ├── find_route
     ├── get_barriers
     ├── get_weather
     ├── get_crowd
     ├── get_assistance
     └── get_evidence
     │
     ▼
Structured Results
     │
     ▼
AI Reasoning / Explanation
     │
     ▼
User
```

The AI should never receive unrestricted database credentials.

------------------------------------------------------------------------

# 7. AI Tool Contract

Each tool should have:

``` text
Name
Description
Input schema
Output schema
Permission requirements
Error behavior
Freshness expectations
```

Example:

``` text
find_accessible_route

Input:
{
  origin,
  destination,
  accessibility_profile_id
}

Output:
{
  routes: [
    {
      route_id,
      distance_m,
      duration_min,
      accessibility_score,
      barriers,
      confidence,
      reasons
    }
  ]
}
```

The LLM consumes the structured response.

------------------------------------------------------------------------

# 8. Accessibility Engine

The accessibility engine is one of the most important domain components.

Input:

``` text
Traveller Profile
+
Destination/Route Data
+
Facilities
+
Active Barriers
+
Current Conditions
```

Output:

``` text
Compatibility Score
+
Reasons
+
Warnings
+
Confidence
```

Example:

``` text
Traveller:
- wheelchair
- no stairs
- max preferred walking = 1000m

Route A:
- stairs = 0
- accessible entrance = verified
- active barrier = none
- distance = 850m

Compatibility = HIGH
```

The exact scoring formula should be versioned and documented rather than
hidden inside the LLM.

------------------------------------------------------------------------

# 9. Recommended Scoring Model

A transparent weighted score can initially use:

``` text
Accessibility Compatibility
        =
  Mobility Fit
+ Facility Fit
+ Barrier Status
+ Distance Fit
+ Route Complexity
+ Current Conditions
+ Assistance Availability
```

Example normalized weights:

``` text
Mobility/step-free fit      30%
Facility compatibility      20%
Active barriers             20%
Distance/effort             10%
Route complexity             5%
Weather/current conditions  10%
Assistance availability      5%
```

These weights are configurable and should be validated through testing.

The system must not present the result as a medical or legal
certification.

------------------------------------------------------------------------

# 10. Route Architecture

Route flow:

``` text
Origin
  ↓
Destination
  ↓
Geocode
  ↓
Request candidate routes
  ↓
Apply accessibility constraints
  ↓
Check barriers
  ↓
Check current conditions
  ↓
Score routes
  ↓
Rank routes
  ↓
Return alternatives
```

Important rule:

**Do not modify the underlying map provider's routing data as if a
barrier were permanently part of the road network.**

Instead, the application layer should apply temporary accessibility
constraints to route candidates.

------------------------------------------------------------------------

# 11. Dynamic Barrier Architecture

A barrier record should contain:

``` text
id
type
location
geometry
description
reported_at
expires_at
status
severity
confidence
source
evidence_id
verified_by
verified_at
```

Example:

``` text
Barrier:
Broken elevator

Status:
VERIFIED

Reported:
10:20 AM

Verified:
11:05 AM

Confidence:
0.94

Effect:
Avoid elevator-dependent route
```

When a verified barrier becomes active:

``` text
Barrier Event
      ↓
Route Engine
      ↓
Affected Routes
      ↓
Recalculate
      ↓
Updated Recommendation
```

------------------------------------------------------------------------

# 12. Trust Architecture

Every important claim should have metadata.

``` text
Claim
 ├── Source
 ├── Source Type
 ├── Created At
 ├── Last Verified At
 ├── Evidence
 ├── Verification Status
 └── Confidence
```

Possible statuses:

``` text
VERIFIED
UNVERIFIED
AI_ASSISTED
DISPUTED
EXPIRED
REJECTED
```

The UI should clearly distinguish these states.

------------------------------------------------------------------------

# 13. Evidence Architecture

Files should NOT be stored directly inside PostgreSQL.

Use:

``` text
Object Storage
      │
      └── Evidence File
             │
             ▼
       Evidence Metadata
             │
             ▼
         PostgreSQL
```

Metadata:

``` text
id
report_id
file_url/key
mime_type
size
uploaded_by
uploaded_at
hash
analysis_status
```

The backend should validate:

-   file type;
-   file size;
-   upload permissions;
-   malicious file risks.

------------------------------------------------------------------------

# 14. AI Vision Flow

Optional advanced feature:

``` text
User Uploads Image
        ↓
Backend Validation
        ↓
Vision Model
        ↓
Potential Accessibility Observation
        ↓
Store AI Analysis
        ↓
Human Verification
        ↓
Verified Barrier / Rejected
```

Important:

``` text
AI Observation ≠ Verified Fact
```

The UI must show this distinction.

------------------------------------------------------------------------

# 15. Weather Architecture

``` text
Destination Coordinates
        ↓
Weather Adapter
        ↓
Weather Provider
        ↓
Normalized Weather Data
        ↓
Route/Itinerary Engine
```

The rest of the application should not depend directly on a specific
weather API response format.

Create an internal normalized model:

``` text
temperature
rain_probability
precipitation
wind
condition
forecast_time
source
retrieved_at
```

------------------------------------------------------------------------

# 16. Crowd Architecture

For the MVP, crowd data can originate from:

-   pilot/demo data;
-   authorized venue information;
-   structured reports;
-   legitimate external data where available.

Normalize it to:

``` text
LOW
MODERATE
HIGH
UNKNOWN
```

Store:

``` text
level
source
timestamp
confidence
```

Never present simulated demo crowd data as live real-world data.

------------------------------------------------------------------------

# 17. Voice Architecture

Voice should be a thin interface around the same backend intelligence.

``` text
                VOICE USER
                    │
                    ▼
              LiveKit Room
                    │
                    ▼
              Voice Agent
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
        STT                 TTS
          │                   ▲
          ▼                   │
              AI COPILOT
                  │
                  ▼
              Tool Layer
                  │
                  ▼
          Application Backend
```

The voice agent should not duplicate route/accessibility business logic.

------------------------------------------------------------------------

# 18. Voice Tool Example

Voice request:

> "Is there a wheelchair accessible route to the museum?"

Flow:

``` text
Speech
 ↓
STT
 ↓
AI Agent
 ↓
get_active_profile()
 ↓
find_accessible_route()
 ↓
get_accessibility()
 ↓
get_barriers()
 ↓
AI response
 ↓
TTS
```

------------------------------------------------------------------------

# 19. Authentication

Recommended initial approach:

``` text
Frontend
   ↓
Authentication Provider
   ↓
Session/JWT
   ↓
FastAPI
   ↓
Role Authorization
```

Roles:

``` text
TRAVELLER
AUDITOR
AUTHORITY
ADMIN
```

Authorization must be enforced by the backend.

------------------------------------------------------------------------

# 20. Database Architecture

Use:

**PostgreSQL + PostGIS**

Why:

-   relational data fits users/reports/verification;
-   geospatial queries are required;
-   places and barriers need coordinates/geometries;
-   route-related spatial filtering becomes easier;
-   strong ecosystem and portability.

------------------------------------------------------------------------

# 21. Core Database Entities

``` text
User
AccessibilityProfile
Place
Facility
AccessibilityRecord
Barrier
Evidence
Verification
RouteRequest
Route
Itinerary
ItineraryStop
WeatherSnapshot
CrowdObservation
AssistancePoint
AuditLog
```

Relationships:

``` text
User
 ├── AccessibilityProfile
 ├── Barrier Reports
 └── Itineraries

Place
 ├── Facilities
 ├── AccessibilityRecords
 ├── Barriers
 └── AssistancePoints

Barrier
 ├── Evidence
 └── Verification

RouteRequest
 └── Routes

Itinerary
 └── ItineraryStops
```

Detailed schema belongs in `DATA_MODEL.md`.

------------------------------------------------------------------------

# 22. API Architecture

The API should be REST-first for the MVP.

Example groups:

``` text
/api/v1/auth
/api/v1/users
/api/v1/profiles
/api/v1/places
/api/v1/accessibility
/api/v1/routes
/api/v1/barriers
/api/v1/evidence
/api/v1/verification
/api/v1/itineraries
/api/v1/weather
/api/v1/crowd
/api/v1/copilot
/api/v1/auditor
```

Versioning begins with:

``` text
/v1
```

------------------------------------------------------------------------

# 23. Example API Flow

### Search destination

``` text
GET /api/v1/places/search?q=...
```

### Get accessibility

``` text
GET /api/v1/places/{id}/accessibility
```

### Route planning

``` text
POST /api/v1/routes/plan
```

### Report barrier

``` text
POST /api/v1/barriers
```

### Upload evidence

``` text
POST /api/v1/evidence
```

### Verify barrier

``` text
POST /api/v1/barriers/{id}/verify
```

### AI copilot

``` text
POST /api/v1/copilot/chat
```

Exact request/response contracts will be specified in
`API_CONTRACTS.md`.

------------------------------------------------------------------------

# 24. External Service Adapter Pattern

Do not call providers throughout the application.

Bad:

``` text
route_service.py
  → Provider A

weather.py
  → Provider A

place.py
  → Provider A
```

Better:

``` text
integrations/
├── maps/
│   ├── interface.py
│   └── provider.py
│
├── weather/
│   ├── interface.py
│   └── provider.py
│
└── ai/
    ├── interface.py
    └── provider.py
```

The business layer talks to the internal interface.

This makes providers replaceable.

------------------------------------------------------------------------

# 25. Data Flow --- Normal Search

``` text
User
 ↓
Next.js
 ↓
FastAPI
 ↓
Place Service
 ↓
PostGIS / External Place Data
 ↓
Normalized Place
 ↓
Next.js
 ↓
Map + Cards
```

------------------------------------------------------------------------

# 26. Data Flow --- Personalized Route

``` text
User
 ↓
Route UI
 ↓
FastAPI
 ↓
Load Accessibility Profile
 ↓
Get Candidate Routes
 ↓
Load Accessibility Records
 ↓
Load Active Barriers
 ↓
Load Weather
 ↓
Load Crowd Data
 ↓
Accessibility Engine
 ↓
Route Scoring
 ↓
Rank Routes
 ↓
API Response
 ↓
Map UI
```

------------------------------------------------------------------------

# 27. Data Flow --- AI Copilot

``` text
User Message
      ↓
FastAPI Copilot Endpoint
      ↓
AI Model
      ↓
Tool Selection
      ↓
Backend Tools
      ↓
Structured Data
      ↓
AI Explanation
      ↓
Response
      ↓
UI
```

------------------------------------------------------------------------

# 28. Data Flow --- Barrier Report

``` text
User
 ↓
Report Form
 ↓
FastAPI
 ↓
Validate
 ↓
Store Report
 ↓
Store Evidence
 ↓
Optional AI Analysis
 ↓
Pending Verification
 ↓
Auditor
 ↓
Verify
 ↓
Trust Engine
 ↓
Route Engine
 ↓
Recommendations Updated
```

------------------------------------------------------------------------

# 29. S21 Extension Point

S21 data can later be added without changing the core route
architecture.

Additional entities:

``` text
TourismImpact
VisitorFlow
LocalPurchase
WasteMetric
WaterMetric
BiodiversityPressure
CommunityBenefit
```

These can become additional ranking signals.

Example:

``` text
Accessibility Score
+
Sustainability/Regenerative Score
=
Future Destination Score
```

------------------------------------------------------------------------

# 30. S22 Extension Point

The AI architecture already supports:

-   multilingual interaction;
-   dynamic itineraries;
-   verified sources;
-   uncertainty labels;
-   crowd-aware recommendations;
-   local services.

Additional controls can be added to the AI tool layer.

------------------------------------------------------------------------

# 31. Security Boundaries

``` text
Browser
  │
  │ public-safe API
  ▼
FastAPI
  │
  ├── Auth
  ├── Authorization
  ├── Validation
  ├── Rate Limits
  │
  ▼
Services
  │
  ├── Database
  ├── External APIs
  └── AI
```

Never:

``` text
Browser → Secret API
Browser → Database
AI → Database credentials
```

------------------------------------------------------------------------

# 32. Environment Configuration

Use:

``` text
.env
.env.example
```

Example categories:

``` text
DATABASE_URL
AUTH_SECRET
AI_API_KEY
MAPS_PROVIDER_KEY
WEATHER_API_KEY
STORAGE credentials
LIVEKIT credentials
STT credentials
TTS credentials
```

`.env` must never be committed.

------------------------------------------------------------------------

# 33. Failure Strategy

External service failures should degrade gracefully.

``` text
AI unavailable
→ Text search and route planning remain usable

Weather unavailable
→ Recommendation shows weather unavailable

Voice unavailable
→ Text copilot remains available

Routing provider unavailable
→ Show existing map/accessibility information

Storage unavailable
→ Report can be saved without evidence if product policy permits,
  or clearly explain that evidence upload must be retried
```

------------------------------------------------------------------------

# 34. Deployment Architecture

Initial deployment:

``` text
                   Internet
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
     Next.js Host             FastAPI Host
          │                       │
          │                       ├── PostgreSQL/PostGIS
          │                       │
          │                       ├── Object Storage
          │                       │
          │                       └── External APIs
          │
          └────── HTTPS ──────────┘
```

Voice:

``` text
Client
 ↓
LiveKit
 ↓
Voice Agent Worker
 ↓
AI + Application APIs
```

Exact cloud provider is intentionally left configurable.

------------------------------------------------------------------------

# 35. Testing Architecture

Testing levels:

## Unit Tests

Test:

-   scoring;
-   trust calculation;
-   barrier state transitions;
-   validation;
-   route ranking.

## Integration Tests

Test:

-   database;
-   API;
-   external service adapters;
-   authentication;
-   evidence workflow.

## End-to-End Tests

Test:

``` text
Profile
→ Destination
→ Route
→ Barrier
→ Verification
→ Route update
→ AI explanation
→ Voice
```

## Accessibility Testing

Test:

-   keyboard navigation;
-   screen reader semantics;
-   contrast;
-   focus;
-   responsive layouts;
-   reduced-motion preferences where relevant.

------------------------------------------------------------------------

# 36. Logging

Every important request should have a request ID.

Important events:

``` text
LOGIN
ROUTE_REQUEST
BARRIER_REPORT
EVIDENCE_UPLOAD
AI_TOOL_CALL
VERIFICATION
ADMIN_ACTION
```

Do not log secrets or unnecessary personal information.

------------------------------------------------------------------------

# 37. AI Agent Boundary

The AI is responsible for:

``` text
Understanding
Planning
Tool selection
Natural-language explanation
Itinerary composition
Conversation
```

The application is responsible for:

``` text
Authentication
Authorization
Data correctness
Scoring
Routing
Verification
Persistence
Security
```

This boundary is critical.

------------------------------------------------------------------------

# 38. Repository Structure

Final planned repository:

``` text
accesspath/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   ├── PHASES.md
│   ├── DESIGN.md
│   ├── API_CONTRACTS.md
│   └── DATA_MODEL.md
│
├── frontend/
│
├── backend/
│
├── ai/
│
├── data/
│   ├── seed/
│   ├── sample/
│   └── schemas/
│
├── tests/
│
├── scripts/
│
├── README.md
├── .env.example
├── .gitignore
└── docker-compose.yml
```

`MEMORY.md` will be created once implementation begins.

------------------------------------------------------------------------

# 39. Recommended Build Boundary

The first implementation should NOT attempt the complete architecture
simultaneously.

Build in this order:

``` text
Foundation
   ↓
Database
   ↓
Accessibility Data
   ↓
Profile
   ↓
Accessibility Engine
   ↓
Map
   ↓
Route Engine
   ↓
Barrier System
   ↓
Verification
   ↓
Weather
   ↓
AI Copilot
   ↓
Voice
   ↓
Vision
   ↓
Dashboards
```

Each stage must be independently testable.

------------------------------------------------------------------------

# 40. Architecture Decision Summary

  Area                  Decision
  --------------------- ---------------------------------------------
  Frontend              Next.js + TypeScript
  Backend               FastAPI + Python
  Database              PostgreSQL + PostGIS
  Maps                  MapLibre + OpenStreetMap ecosystem
  Routing               Provider behind internal adapter
  Weather               Provider behind internal adapter
  AI                    Gemini through application-controlled tools
  Voice                 LiveKit + STT + Murf TTS
  Storage               Object storage
  API                   REST `/api/v1`
  Authentication        External auth/session layer
  Authorization         Backend RBAC
  Deployment            Independently deployable frontend/backend
  Architecture          Modular monolith initially
  AI role               Copilot/orchestration, not source of truth
  Accessibility logic   Deterministic application engine
  Verification          Human/auditor workflow
  Dynamic barriers      Application-level route constraints

------------------------------------------------------------------------

# 41. Key Architectural Principle

## Start as a Modular Monolith

Do NOT begin with microservices.

For an SIH project and a small team:

``` text
One Backend
+
Clear Internal Modules
+
One Database
```

is preferable to:

``` text
10 Microservices
+
10 Deployments
+
Complex Networking
```

The internal module boundaries make future extraction possible if the
system grows.

------------------------------------------------------------------------

# 42. Definition of Done --- Architecture

Architecture is considered ready for implementation when:

-   [ ] Frontend/backend boundary is defined.
-   [ ] AI boundary is defined.
-   [ ] Database responsibility is defined.
-   [ ] External API adapter strategy is defined.
-   [ ] Accessibility engine is independent of the LLM.
-   [ ] Voice uses the same copilot/tool layer.
-   [ ] Barrier lifecycle is defined.
-   [ ] Verification model is defined.
-   [ ] Trust metadata is defined.
-   [ ] Security boundaries are defined.
-   [ ] Repository structure is defined.
-   [ ] Deployment model is defined.
-   [ ] Testing strategy is defined.
-   [ ] S21/S22 extension points are documented.

------------------------------------------------------------------------

## Next Document

**`RULES.md`**

It will define the coding rules, AI-agent rules, architecture
constraints, security rules, accessibility rules, error-handling rules,
Git rules, and "do not break existing functionality" rules that every
implementation agent must follow.
