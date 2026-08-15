# AccessPath --- API Contracts

**Project:** S20 --- Accessible Journey Planner with Real-Time Barrier
and Assistance Mapping\
**Document:** REST API Contract Specification\
**Version:** 1.0\
**Base Path:** `/api/v1`

------------------------------------------------------------------------

# 1. API Principles

The API is the boundary between the frontend and backend.

Rules:

-   JSON request/response bodies unless otherwise specified;
-   authenticated endpoints require authentication;
-   authorization is enforced server-side;
-   all inputs are validated;
-   errors use consistent schemas;
-   API keys for external providers never reach the frontend;
-   AI accesses business functionality through internal tools/services,
    not raw database access.

------------------------------------------------------------------------

# 2. Base Response Conventions

Successful response:

``` json
{
  "data": {},
  "meta": {}
}
```

List response:

``` json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

Error response:

``` json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": {}
  }
}
```

Never return internal stack traces.

------------------------------------------------------------------------

# 3. HTTP Status Codes

Use:

``` text
200 OK
201 Created
202 Accepted
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

------------------------------------------------------------------------

# 4. Authentication

Recommended authentication flow:

``` text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

The exact identity provider may be changed later.

------------------------------------------------------------------------

# 5. Register

``` text
POST /api/v1/auth/register
```

Request:

``` json
{
  "email": "user@example.com",
  "password": "********",
  "display_name": "Traveller"
}
```

Response:

``` json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name": "Traveller",
      "role": "TRAVELLER"
    }
  }
}
```

Never return password data.

------------------------------------------------------------------------

# 6. Login

``` text
POST /api/v1/auth/login
```

Request:

``` json
{
  "email": "user@example.com",
  "password": "********"
}
```

Response should use secure session/cookie or approved token
architecture.

Do not expose long-lived secrets unnecessarily to browser JavaScript.

------------------------------------------------------------------------

# 7. Current User

``` text
GET /api/v1/auth/me
```

Response:

``` json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Traveller",
    "role": "TRAVELLER"
  }
}
```

------------------------------------------------------------------------

# 8. Accessibility Profile

## Create

``` text
POST /api/v1/profiles
```

Request:

``` json
{
  "mobility_preferences": {
    "wheelchair": true,
    "limited_walking": true
  },
  "vision_preferences": {},
  "hearing_preferences": {},
  "cognitive_preferences": {},
  "walking_limit_meters": 1000,
  "avoid_stairs": true,
  "prefer_step_free": true,
  "prefer_rest_stops": true,
  "preferred_route_style": "MOST_ACCESSIBLE"
}
```

Response:

``` json
{
  "data": {
    "id": "uuid",
    "prefer_step_free": true,
    "avoid_stairs": true,
    "walking_limit_meters": 1000,
    "preferred_route_style": "MOST_ACCESSIBLE"
  }
}
```

------------------------------------------------------------------------

# 9. Get Profile

``` text
GET /api/v1/profiles/{profile_id}
```

Only authorized users may access their profile unless an explicit
permission model exists.

------------------------------------------------------------------------

# 10. Update Profile

``` text
PUT /api/v1/profiles/{profile_id}
```

Use the same validation rules as creation.

------------------------------------------------------------------------

# 11. Search Places

``` text
GET /api/v1/places
```

Query parameters:

``` text
q
lat
lng
radius
category
step_free
accessible_toilet
low_walking
verified_only
page
page_size
```

Example:

``` text
GET /api/v1/places?q=museum&step_free=true&verified_only=true
```

Response:

``` json
{
  "data": [
    {
      "id": "uuid",
      "name": "City Museum",
      "category": "MUSEUM",
      "location": {
        "lat": 20.296,
        "lng": 85.824
      },
      "accessibility_summary": {
        "level": "HIGH",
        "verified": true
      }
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 1
  }
}
```

------------------------------------------------------------------------

# 12. Place Details

``` text
GET /api/v1/places/{place_id}
```

Response should include:

``` text
basic place data
accessibility summary
facilities
active barriers
assistance
trust metadata
last verification
```

------------------------------------------------------------------------

# 13. Place Accessibility

``` text
GET /api/v1/places/{place_id}/accessibility
```

Response:

``` json
{
  "data": {
    "place_id": "uuid",
    "features": [
      {
        "feature": "STEP_FREE_ENTRANCE",
        "status": "AVAILABLE",
        "confidence": "HIGH",
        "source_type": "AUDITOR",
        "last_verified_at": "2026-08-15T10:00:00Z"
      }
    ]
  }
}
```

Never convert `UNKNOWN` into `AVAILABLE`.

------------------------------------------------------------------------

# 14. Facilities

``` text
GET /api/v1/places/{place_id}/facilities
```

Optional filters:

``` text
type
status
```

------------------------------------------------------------------------

# 15. Active Barriers Near Location

``` text
GET /api/v1/barriers/nearby
```

Query:

``` text
lat
lng
radius
status
severity
```

Example:

``` text
GET /api/v1/barriers/nearby?lat=20.296&lng=85.824&radius=500
```

Only return active statuses according to business rules.

------------------------------------------------------------------------

# 16. Barrier Details

``` text
GET /api/v1/barriers/{barrier_id}
```

Response:

``` json
{
  "data": {
    "id": "uuid",
    "title": "Elevator temporarily unavailable",
    "type": "BROKEN_ELEVATOR",
    "severity": "HIGH",
    "status": "ACTIVE",
    "observed_at": "2026-08-15T09:30:00Z",
    "verified_at": "2026-08-15T10:15:00Z",
    "confidence": "HIGH"
  }
}
```

------------------------------------------------------------------------

# 17. Report Barrier

``` text
POST /api/v1/reports
```

Request:

``` json
{
  "report_type": "BARRIER",
  "place_id": "uuid",
  "title": "Elevator unavailable",
  "description": "The main elevator is currently unavailable.",
  "location": {
    "lat": 20.296,
    "lng": 85.824
  }
}
```

Response:

``` json
{
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "created_at": "2026-08-15T10:20:00Z"
  }
}
```

------------------------------------------------------------------------

# 18. Upload Evidence

``` text
POST /api/v1/reports/{report_id}/evidence
```

Use:

``` text
multipart/form-data
```

The backend must validate:

-   authentication;
-   authorization;
-   file type;
-   file size;
-   filename;
-   storage key.

Response:

``` json
{
  "data": {
    "id": "uuid",
    "mime_type": "image/jpeg",
    "size_bytes": 123456,
    "created_at": "2026-08-15T10:22:00Z"
  }
}
```

Do not expose internal storage credentials.

------------------------------------------------------------------------

# 19. My Reports

``` text
GET /api/v1/reports/me
```

Filters:

``` text
status
type
page
page_size
```

------------------------------------------------------------------------

# 20. Auditor Reports

``` text
GET /api/v1/auditor/reports
```

Required role:

``` text
AUDITOR
AUTHORITY
ADMIN
```

Filters:

``` text
status
severity
type
date_from
date_to
lat
lng
radius
```

------------------------------------------------------------------------

# 21. Verify Report

``` text
POST /api/v1/auditor/reports/{report_id}/verify
```

Request:

``` json
{
  "action": "VERIFY",
  "reason": "Evidence confirms the reported temporary elevator outage."
}
```

Response:

``` json
{
  "data": {
    "report_id": "uuid",
    "status": "VERIFIED",
    "verification_id": "uuid"
  }
}
```

Server must derive the acting user from authentication.

Never accept:

``` json
{
  "verified_by": "uuid"
}
```

from an untrusted client.

------------------------------------------------------------------------

# 22. Reject Report

``` text
POST /api/v1/auditor/reports/{report_id}/reject
```

Request:

``` json
{
  "reason": "Evidence does not support the reported barrier."
}
```

------------------------------------------------------------------------

# 23. Resolve Barrier

``` text
POST /api/v1/auditor/barriers/{barrier_id}/resolve
```

Request:

``` json
{
  "reason": "Facility restored and verified."
}
```

------------------------------------------------------------------------

# 24. Route Planning

``` text
POST /api/v1/routes/plan
```

Request:

``` json
{
  "origin": {
    "lat": 20.296,
    "lng": 85.824
  },
  "destination": {
    "lat": 20.300,
    "lng": 85.830
  },
  "profile_id": "uuid",
  "preferences": {
    "avoid_stairs": true,
    "prefer_step_free": true
  }
}
```

Response:

``` json
{
  "data": {
    "request_id": "uuid",
    "routes": [
      {
        "id": "uuid",
        "rank": 1,
        "distance_meters": 1100,
        "duration_seconds": 1680,
        "accessibility_score": 87,
        "walking_distance_meters": 900,
        "barrier_count": 0,
        "confidence": "HIGH",
        "reasons": [
          "step_free",
          "low_walking_distance",
          "no_active_verified_barriers"
        ],
        "warnings": []
      }
    ]
  }
}
```

------------------------------------------------------------------------

# 25. Route Details

``` text
GET /api/v1/routes/{route_id}
```

Return:

``` text
geometry
segments
accessibility analysis
barriers
warnings
score
reasons
confidence
```

------------------------------------------------------------------------

# 26. Recalculate Route

``` text
POST /api/v1/routes/{route_id}/recalculate
```

Use when:

-   a barrier changes;
-   weather changes;
-   user changes preferences;
-   destination changes.

Response uses the same route schema as planning.

------------------------------------------------------------------------

# 27. Route Impact of Barrier

Internal service/tool contract:

``` text
POST /api/v1/internal/routes/{route_id}/impact
```

This endpoint should normally remain internal to trusted backend
services.

Response:

``` json
{
  "data": {
    "affected": true,
    "severity": "HIGH",
    "recommended_action": "RECALCULATE"
  }
}
```

Do not expose internal endpoints publicly without a deliberate security
design.

------------------------------------------------------------------------

# 28. Weather

``` text
GET /api/v1/context/weather
```

Query:

``` text
lat
lng
```

Response:

``` json
{
  "data": {
    "condition": "LIGHT_RAIN",
    "temperature_c": 27.4,
    "rain_probability": 65,
    "wind_speed_kph": 12,
    "observed_at": "2026-08-15T10:00:00Z",
    "source": "provider"
  }
}
```

If unavailable:

``` text
503 Service Unavailable
```

or a normalized unavailable response according to frontend requirements.

Do not fabricate weather.

------------------------------------------------------------------------

# 29. Assistance Points

``` text
GET /api/v1/assistance
```

Query:

``` text
lat
lng
radius
type
```

Response:

``` json
{
  "data": [
    {
      "id": "uuid",
      "name": "Visitor Assistance Desk",
      "type": "INFORMATION_DESK",
      "location": {
        "lat": 20.296,
        "lng": 85.824
      },
      "availability_status": "AVAILABLE",
      "last_verified_at": "2026-08-15T09:00:00Z"
    }
  ]
}
```

------------------------------------------------------------------------

# 30. Itinerary Creation

``` text
POST /api/v1/itineraries
```

Request:

``` json
{
  "title": "Accessible afternoon",
  "stops": [
    {
      "place_id": "uuid",
      "planned_start": "2026-08-15T10:00:00Z"
    }
  ],
  "source": "USER_CREATED"
}
```

------------------------------------------------------------------------

# 31. Get Itinerary

``` text
GET /api/v1/itineraries/{itinerary_id}
```

Response should include:

``` text
stops
routes between stops
accessibility snapshots
current barrier warnings
```

------------------------------------------------------------------------

# 32. Update Itinerary

``` text
PUT /api/v1/itineraries/{itinerary_id}
```

The user should be able to:

-   reorder stops;
-   add stops;
-   remove stops;
-   change timing;
-   change notes.

AI-generated itineraries remain editable.

------------------------------------------------------------------------

# 33. Copilot API

``` text
POST /api/v1/copilot/chat
```

Request:

``` json
{
  "message": "Find a step-free route to the museum.",
  "conversation_id": "uuid"
}
```

Response:

``` json
{
  "data": {
    "conversation_id": "uuid",
    "message": "I found a step-free route that matches your preferences.",
    "actions": [
      {
        "type": "SHOW_ROUTE",
        "route_id": "uuid"
      }
    ],
    "sources": [
      {
        "type": "ACCESSIBILITY_RECORD",
        "id": "uuid"
      }
    ]
  }
}
```

The AI should call approved tools behind this endpoint.

------------------------------------------------------------------------

# 34. Copilot Tool Contract

Approved tools should conceptually include:

``` text
search_places
get_place
get_accessibility
get_active_barriers
find_accessible_route
get_weather
get_assistance
get_itinerary
create_itinerary
update_itinerary
```

Tool inputs and outputs should be typed.

------------------------------------------------------------------------

# 35. Voice Agent Contract

Voice should reuse the Copilot/tool layer.

Architecture:

``` text
Voice
 ↓
STT
 ↓
Copilot
 ↓
Tools
 ↓
Application
 ↓
TTS
```

The voice agent must not create separate route or accessibility logic.

Possible voice session endpoint:

``` text
POST /api/v1/voice/session
```

Response may provide temporary connection/session information.

Never return long-lived service credentials.

------------------------------------------------------------------------

# 36. Evidence AI Analysis

``` text
POST /api/v1/internal/evidence/{evidence_id}/analyze
```

Internal service.

Response:

``` json
{
  "data": {
    "observations": [
      {
        "type": "POSSIBLE_BLOCKED_RAMP",
        "observation": "The uploaded image may show an obstruction near the ramp.",
        "confidence": 0.81
      }
    ]
  }
}
```

Important:

``` text
AI observation ≠ verification
```

------------------------------------------------------------------------

# 37. Search / Discovery API

``` text
GET /api/v1/search
```

Query:

``` text
q
lat
lng
radius
category
accessibility_features
```

Response can combine:

``` text
places
assistance
barriers
```

Do not return unnecessary private data.

------------------------------------------------------------------------

# 38. User Preferences

``` text
GET /api/v1/users/me/preferences
PUT /api/v1/users/me/preferences
```

Use for non-sensitive UI/application preferences such as:

``` text
language
units
reduced_motion
map_style
notification_preferences
```

Accessibility travel requirements belong in the accessibility profile.

------------------------------------------------------------------------

# 39. Health Check

``` text
GET /api/v1/health
```

Response:

``` json
{
  "status": "ok"
}
```

A deeper internal health endpoint may check:

``` text
database
external provider connectivity
queue
storage
```

Do not expose secrets or detailed infrastructure information publicly.

------------------------------------------------------------------------

# 40. Rate Limiting

Rate-limit at least:

``` text
authentication
report submission
evidence upload
copilot
route planning
search
voice session creation
```

AI and external-provider operations should have stricter controls
because they may incur cost.

------------------------------------------------------------------------

# 41. Idempotency

For operations where duplicate requests are dangerous or expensive,
support an idempotency key.

Examples:

``` text
POST /reports
POST /routes/plan
POST /itineraries
```

Especially important for mobile networks where requests can be retried.

------------------------------------------------------------------------

# 42. Pagination

Use:

``` text
page
page_size
```

or cursor pagination for large datasets.

Default:

``` text
page_size = 20
```

Maximum:

``` text
page_size = 100
```

Do not allow unrestricted list queries.

------------------------------------------------------------------------

# 43. Validation

Validate:

-   UUIDs;
-   coordinates;
-   radius;
-   enum values;
-   timestamps;
-   file sizes;
-   text lengths;
-   pagination;
-   ownership;
-   permissions.

Geographic coordinates must be within valid ranges.

------------------------------------------------------------------------

# 44. Authorization Matrix

``` text
                         Traveller Auditor Authority Admin
Profile                     ✓       own      own       ✓
Places                      ✓        ✓        ✓        ✓
Route planning              ✓        ✓        ✓        ✓
Report barrier              ✓        ✓        ✓        ✓
View reports                own      ✓        ✓        ✓
Verify report               ✗        ✓        ✓        ✓
Manage users                ✗        ✗        limited  ✓
Audit logs                  ✗        limited  ✓        ✓
```

Exact authorization should be implemented server-side.

------------------------------------------------------------------------

# 45. API Versioning

Current:

``` text
/api/v1
```

Breaking changes require:

``` text
/api/v2
```

Do not silently change response shapes of important endpoints.

------------------------------------------------------------------------

# 46. External Provider Adapter Boundary

The API must not expose provider-specific response formats directly.

Bad:

``` json
{
  "google_specific_field": "..."
}
```

Good:

``` json
{
  "distance_meters": 1100,
  "duration_seconds": 1680
}
```

Provider adapters normalize data.

------------------------------------------------------------------------

# 47. API Security Rules

Never:

-   expose database credentials;
-   expose provider API keys;
-   accept arbitrary SQL;
-   trust client roles;
-   trust client ownership claims;
-   return raw exceptions;
-   expose private evidence URLs without authorization.

Use secure object-storage access patterns for private evidence.

------------------------------------------------------------------------

# 48. API Error Codes

Recommended codes:

``` text
VALIDATION_ERROR
AUTH_REQUIRED
FORBIDDEN
RESOURCE_NOT_FOUND
CONFLICT
RATE_LIMITED
PROVIDER_UNAVAILABLE
ROUTE_UNAVAILABLE
AI_UNAVAILABLE
VOICE_UNAVAILABLE
EVIDENCE_INVALID
VERIFICATION_REQUIRED
UNKNOWN_ACCESSIBILITY
INTERNAL_ERROR
```

------------------------------------------------------------------------

# 49. Frontend API Client Structure

Recommended:

``` text
frontend/
└── lib/
    └── api/
        ├── client.ts
        ├── auth.ts
        ├── places.ts
        ├── accessibility.ts
        ├── routes.ts
        ├── reports.ts
        ├── itineraries.ts
        ├── copilot.ts
        └── context.ts
```

Components should not construct raw API URLs everywhere.

------------------------------------------------------------------------

# 50. Backend Structure

Recommended:

``` text
backend/
└── app/
    ├── api/
    │   └── v1/
    │       ├── auth.py
    │       ├── profiles.py
    │       ├── places.py
    │       ├── routes.py
    │       ├── reports.py
    │       ├── auditor.py
    │       ├── itineraries.py
    │       ├── copilot.py
    │       └── context.py
    │
    ├── services/
    ├── repositories/
    ├── models/
    ├── schemas/
    ├── integrations/
    ├── ai/
    └── core/
```

------------------------------------------------------------------------

# 51. API Testing

Every important endpoint should have tests for:

``` text
success
validation failure
unauthorized
forbidden
not found
provider failure
database failure
```

Critical flows require integration/E2E tests.

------------------------------------------------------------------------

# 52. Critical API Journey

The following must work:

``` text
POST /profiles
        ↓
GET /places
        ↓
GET /places/{id}/accessibility
        ↓
POST /routes/plan
        ↓
POST /reports
        ↓
POST /reports/{id}/evidence
        ↓
POST /auditor/reports/{id}/verify
        ↓
POST /routes/{id}/recalculate
        ↓
POST /copilot/chat
```

Voice should use the same application logic behind the Copilot.

------------------------------------------------------------------------

# 53. SIH Demo API Scenario

The deterministic demo should support:

``` text
GET demo destination
        ↓
POST route
        ↓
Create barrier
        ↓
Verify barrier
        ↓
Recalculate route
        ↓
Show changed recommendation
        ↓
Ask Copilot why
```

This flow should work even if an external provider temporarily fails.

------------------------------------------------------------------------

# 54. API Definition of Done

Before implementation is considered complete:

-   [ ] endpoint names are stable;
-   [ ] request schemas are defined;
-   [ ] response schemas are defined;
-   [ ] error format is defined;
-   [ ] authentication is defined;
-   [ ] authorization is defined;
-   [ ] rate limiting is defined;
-   [ ] validation is defined;
-   [ ] AI tool boundary is defined;
-   [ ] voice uses the same business logic;
-   [ ] external providers are abstracted;
-   [ ] critical endpoints have tests.

------------------------------------------------------------------------

# 55. Final API Principle

## The API should expose capabilities, not implementation details.

The frontend and AI should ask:

``` text
"Find an accessible route."
```

not:

``` text
"Give me database rows from table X."
```

The backend owns:

``` text
validation
+
authorization
+
business logic
+
data trust
+
provider integration
```

The AI explains and orchestrates those capabilities.

The result is a system that is easier to secure, test, replace, and
scale.
