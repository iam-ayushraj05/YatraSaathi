# AccessPath --- Data Model Specification

**Project:** S20 --- Accessible Journey Planner with Real-Time Barrier
and Assistance Mapping\
**Document:** PostgreSQL + PostGIS Data Model\
**Version:** 1.0

------------------------------------------------------------------------

# 1. Database Strategy

Use:

``` text
PostgreSQL
+
PostGIS
```

The database stores:

-   users;
-   traveller preferences;
-   destinations;
-   accessibility facilities;
-   accessibility claims;
-   barriers;
-   evidence;
-   verification;
-   routes;
-   itineraries;
-   current conditions;
-   assistance points;
-   audit history.

The database is the source of truth for application state.

The AI must access this data through application services/tools rather
than arbitrary SQL.

------------------------------------------------------------------------

# 2. Entity Relationship Overview

``` text
users
  │
  ├── accessibility_profiles
  │
  ├── reports
  │       │
  │       ├── evidence
  │       └── verifications
  │
  └── itineraries
          │
          └── itinerary_stops

places
  │
  ├── accessibility_records
  │       └── facilities
  │
  ├── barriers
  │       └── evidence
  │
  └── assistance_points

route_requests
  │
  └── routes
          └── route_segments

weather_snapshots

crowd_observations

audit_logs
```

------------------------------------------------------------------------

# 3. Common Conventions

All primary keys should use UUIDs.

Example:

``` sql
id UUID PRIMARY KEY
```

Timestamps:

``` text
created_at
updated_at
```

Use UTC internally.

Display localized times in the frontend.

Geospatial coordinates:

``` text
SRID 4326
```

Use PostGIS geography/geometry types consistently.

------------------------------------------------------------------------

# 4. Users

Table:

``` text
users
```

Purpose:

Application account.

Fields:

``` text
id UUID PK
email VARCHAR UNIQUE
display_name VARCHAR
role user_role
is_active BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Role enum:

``` text
TRAVELLER
AUDITOR
AUTHORITY
ADMIN
```

Rules:

-   role must be validated server-side;
-   never trust frontend role values;
-   email should be normalized;
-   deactivation should not destroy historical audit records.

------------------------------------------------------------------------

# 5. Accessibility Profiles

Table:

``` text
accessibility_profiles
```

Fields:

``` text
id UUID PK
user_id UUID FK → users.id
mobility_preferences JSONB
vision_preferences JSONB
hearing_preferences JSONB
cognitive_preferences JSONB
walking_limit_meters INTEGER NULL
avoid_stairs BOOLEAN
prefer_step_free BOOLEAN
prefer_rest_stops BOOLEAN
preferred_route_style route_style
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Possible route styles:

``` text
MOST_ACCESSIBLE
LEAST_WALKING
FASTEST_ACCESSIBLE
BALANCED
```

Do not store unnecessary medical diagnoses.

Store travel requirements/preferences rather than sensitive clinical
information.

------------------------------------------------------------------------

# 6. Places

Table:

``` text
places
```

Fields:

``` text
id UUID PK
name VARCHAR
description TEXT
category place_category
address TEXT
city VARCHAR
region VARCHAR
country VARCHAR
location GEOGRAPHY(POINT, 4326)
website_url TEXT NULL
phone VARCHAR NULL
opening_hours JSONB NULL
source_type source_type
source_url TEXT NULL
source_reference TEXT NULL
status record_status
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Categories may include:

``` text
MUSEUM
PARK
MONUMENT
TEMPLE
ATTRACTION
RESTAURANT
CAFE
HOTEL
TRANSPORT
SHOP
HOSPITAL
OTHER
```

------------------------------------------------------------------------

# 7. Accessibility Records

Table:

``` text
accessibility_records
```

Purpose:

Structured accessibility claims for a place.

Fields:

``` text
id UUID PK
place_id UUID FK → places.id
feature accessibility_feature
status accessibility_status
description TEXT
confidence confidence_level
source_type source_type
source_reference TEXT NULL
last_verified_at TIMESTAMPTZ NULL
expires_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Features:

``` text
STEP_FREE_ENTRANCE
ACCESSIBLE_TOILET
ELEVATOR
ACCESSIBLE_PARKING
TACTILE_GUIDANCE
HEARING_ASSISTANCE
VISUAL_ASSISTANCE
REST_AREA
WHEELCHAIR_AVAILABLE
ACCESSIBLE_ROUTE
LOW_WALKING_ACCESS
OTHER
```

Statuses:

``` text
AVAILABLE
UNAVAILABLE
UNKNOWN
TEMPORARILY_UNAVAILABLE
```

Important:

``` text
UNKNOWN != AVAILABLE
```

------------------------------------------------------------------------

# 8. Facilities

Table:

``` text
facilities
```

Purpose:

Physical or service facility attached to a place.

Fields:

``` text
id UUID PK
place_id UUID FK → places.id
facility_type facility_type
name VARCHAR
description TEXT NULL
location GEOGRAPHY(POINT, 4326) NULL
status record_status
source_type source_type
last_verified_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Facility types:

``` text
ENTRANCE
TOILET
ELEVATOR
RAMP
PARKING
REST_AREA
ASSISTANCE_DESK
TACTILE_PATH
HEARING_SYSTEM
OTHER
```

------------------------------------------------------------------------

# 9. Barriers

Table:

``` text
barriers
```

Purpose:

Temporary or persistent accessibility obstacles.

Fields:

``` text
id UUID PK
place_id UUID FK → places.id NULL
reported_by UUID FK → users.id
barrier_type barrier_type
title VARCHAR
description TEXT
severity barrier_severity
location GEOGRAPHY(POINT, 4326)
status barrier_status
observed_at TIMESTAMPTZ
reported_at TIMESTAMPTZ
verified_at TIMESTAMPTZ NULL
expires_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Barrier types:

``` text
BROKEN_ELEVATOR
BLOCKED_RAMP
BLOCKED_PATH
CLOSED_ENTRANCE
CONSTRUCTION
PARKING_BLOCKED
TOILET_UNAVAILABLE
ASSISTANCE_UNAVAILABLE
OTHER
```

Severity:

``` text
LOW
MEDIUM
HIGH
CRITICAL
```

Status:

``` text
SUBMITTED
PENDING_REVIEW
VERIFIED
ACTIVE
RESOLVED
EXPIRED
REJECTED
DISPUTED
```

Lifecycle:

``` text
SUBMITTED
→ PENDING_REVIEW
→ VERIFIED
→ ACTIVE
→ RESOLVED
```

Alternate:

``` text
PENDING_REVIEW
→ REJECTED
```

or:

``` text
VERIFIED
→ DISPUTED
```

------------------------------------------------------------------------

# 10. Reports

Table:

``` text
reports
```

Purpose:

Generic user-submitted reports.

Fields:

``` text
id UUID PK
user_id UUID FK → users.id
place_id UUID FK → places.id NULL
report_type report_type
title VARCHAR
description TEXT
location GEOGRAPHY(POINT, 4326) NULL
status report_status
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Possible report types:

``` text
BARRIER
ACCESSIBILITY_UPDATE
FACILITY_CHANGE
ASSISTANCE_ISSUE
OTHER
```

A barrier can either be directly represented by the report or linked
through a `report_id` depending on implementation.

Recommended:

``` text
barriers.report_id UUID FK → reports.id
```

------------------------------------------------------------------------

# 11. Evidence

Table:

``` text
evidence
```

Purpose:

Evidence supporting reports or accessibility claims.

Fields:

``` text
id UUID PK
report_id UUID FK → reports.id NULL
barrier_id UUID FK → barriers.id NULL
uploaded_by UUID FK → users.id
storage_key TEXT
original_filename TEXT
mime_type VARCHAR
file_size_bytes BIGINT
sha256_hash VARCHAR
ai_analysis JSONB NULL
ai_confidence NUMERIC NULL
created_at TIMESTAMPTZ
```

Rules:

-   actual files should be stored in object storage;
-   database stores metadata;
-   validate file type;
-   validate file size;
-   generate safe storage keys;
-   do not execute uploaded files.

------------------------------------------------------------------------

# 12. AI Evidence Observations

AI analysis should be stored separately when it becomes complex.

Optional table:

``` text
evidence_observations
```

Fields:

``` text
id UUID PK
evidence_id UUID FK → evidence.id
model_name VARCHAR
observation_type VARCHAR
observation TEXT
confidence NUMERIC
created_at TIMESTAMPTZ
```

Example:

``` text
observation:
"Possible blocked ramp"

confidence:
0.81
```

This is an AI observation, NOT verification.

------------------------------------------------------------------------

# 13. Verifications

Table:

``` text
verifications
```

Purpose:

Human or authorized-source verification.

Fields:

``` text
id UUID PK
report_id UUID FK → reports.id NULL
barrier_id UUID FK → barriers.id NULL
verified_by UUID FK → users.id
action verification_action
reason TEXT
previous_status VARCHAR
new_status VARCHAR
created_at TIMESTAMPTZ
```

Actions:

``` text
VERIFY
REJECT
DISPUTE
RESOLVE
EXPIRE
```

Auditability is mandatory.

------------------------------------------------------------------------

# 14. Audit Logs

Table:

``` text
audit_logs
```

Fields:

``` text
id UUID PK
actor_user_id UUID FK → users.id NULL
action VARCHAR
entity_type VARCHAR
entity_id UUID
metadata JSONB
created_at TIMESTAMPTZ
```

Examples:

``` text
BARRIER_VERIFIED
REPORT_REJECTED
PROFILE_UPDATED
ROLE_CHANGED
EVIDENCE_ADDED
```

Do not store secrets.

------------------------------------------------------------------------

# 15. Assistance Points

Table:

``` text
assistance_points
```

Fields:

``` text
id UUID PK
place_id UUID FK → places.id NULL
name VARCHAR
assistance_type assistance_type
description TEXT
location GEOGRAPHY(POINT, 4326)
availability_status availability_status
source_type source_type
last_verified_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Types:

``` text
INFORMATION_DESK
MEDICAL_ASSISTANCE
EMERGENCY_ASSISTANCE
WHEELCHAIR_SUPPORT
HEARING_SUPPORT
GUIDE_SUPPORT
OTHER
```

------------------------------------------------------------------------

# 16. Route Requests

Table:

``` text
route_requests
```

Fields:

``` text
id UUID PK
user_id UUID FK → users.id NULL
profile_id UUID FK → accessibility_profiles.id NULL
origin GEOGRAPHY(POINT, 4326)
destination GEOGRAPHY(POINT, 4326)
preferences JSONB
requested_at TIMESTAMPTZ
```

Do not store unnecessary historical location information indefinitely.

Define retention rules before production deployment.

------------------------------------------------------------------------

# 17. Routes

Table:

``` text
routes
```

Fields:

``` text
id UUID PK
route_request_id UUID FK → route_requests.id
provider VARCHAR
provider_route_id VARCHAR NULL
geometry GEOMETRY(LINESTRING, 4326)
distance_meters NUMERIC
duration_seconds INTEGER
accessibility_score NUMERIC
walking_distance_meters NUMERIC
stairs_count INTEGER NULL
barrier_count INTEGER
confidence confidence_level
ranking_reason JSONB
created_at TIMESTAMPTZ
```

The route geometry is provider/application output and should not be
treated as accessibility verification by itself.

------------------------------------------------------------------------

# 18. Route Segments

Table:

``` text
route_segments
```

Fields:

``` text
id UUID PK
route_id UUID FK → routes.id
sequence INTEGER
geometry GEOMETRY(LINESTRING, 4326)
distance_meters NUMERIC
duration_seconds INTEGER
surface_type VARCHAR NULL
stairs_count INTEGER NULL
accessibility_status accessibility_status
barrier_count INTEGER
metadata JSONB
```

This enables segment-level accessibility analysis.

------------------------------------------------------------------------

# 19. Route Constraints

Rather than hardcoding every preference, maintain normalized request
constraints.

Optional table:

``` text
route_constraints
```

Fields:

``` text
id UUID PK
route_request_id UUID FK → route_requests.id
constraint_type VARCHAR
value JSONB
priority INTEGER
```

Examples:

``` text
AVOID_STAIRS
MAX_WALKING_DISTANCE
REQUIRE_STEP_FREE
PREFER_REST_STOPS
AVOID_ACTIVE_BARRIERS
```

------------------------------------------------------------------------

# 20. Itineraries

Table:

``` text
itineraries
```

Fields:

``` text
id UUID PK
user_id UUID FK → users.id
title VARCHAR
start_time TIMESTAMPTZ NULL
end_time TIMESTAMPTZ NULL
status itinerary_status
generated_by itinerary_source
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Status:

``` text
DRAFT
ACTIVE
COMPLETED
CANCELLED
```

Source:

``` text
USER_CREATED
AI_GENERATED
HYBRID
```

AI-generated itineraries must remain editable.

------------------------------------------------------------------------

# 21. Itinerary Stops

Table:

``` text
itinerary_stops
```

Fields:

``` text
id UUID PK
itinerary_id UUID FK → itineraries.id
place_id UUID FK → places.id
sequence INTEGER
planned_start TIMESTAMPTZ NULL
planned_end TIMESTAMPTZ NULL
notes TEXT NULL
accessibility_snapshot JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Why snapshot?

Accessibility information can change after the itinerary is generated.

The snapshot records what the system knew when the itinerary was
created.

------------------------------------------------------------------------

# 22. Weather Snapshots

Table:

``` text
weather_snapshots
```

Fields:

``` text
id UUID PK
location GEOGRAPHY(POINT, 4326)
provider VARCHAR
condition VARCHAR
temperature_c NUMERIC
rain_probability NUMERIC NULL
wind_speed_kph NUMERIC NULL
observed_at TIMESTAMPTZ
expires_at TIMESTAMPTZ NULL
raw_metadata JSONB NULL
created_at TIMESTAMPTZ
```

Weather data should have a provider and timestamp.

------------------------------------------------------------------------

# 23. Crowd Observations

Table:

``` text
crowd_observations
```

Fields:

``` text
id UUID PK
place_id UUID FK → places.id
crowd_level crowd_level
source_type source_type
confidence confidence_level
observed_at TIMESTAMPTZ
expires_at TIMESTAMPTZ NULL
metadata JSONB
created_at TIMESTAMPTZ
```

Crowd data may be:

``` text
LOW
MODERATE
HIGH
VERY_HIGH
UNKNOWN
```

Demo observations must be clearly labelled.

------------------------------------------------------------------------

# 24. Source Types

Create a reusable enum:

``` text
source_type
```

Values:

``` text
OFFICIAL
AUTHORITY
AUDITOR
COMMUNITY
USER_REPORTED
AI_ASSISTED
OPEN_DATA
EXTERNAL_API
DEMO
UNKNOWN
```

This field is critical for trust.

------------------------------------------------------------------------

# 25. Confidence

Enum:

``` text
confidence_level
```

Values:

``` text
LOW
MEDIUM
HIGH
UNKNOWN
```

Confidence should be derived from application rules, not arbitrarily
invented by the LLM.

------------------------------------------------------------------------

# 26. Record Status

Enum:

``` text
record_status
```

Values:

``` text
ACTIVE
INACTIVE
EXPIRED
PENDING
ARCHIVED
```

------------------------------------------------------------------------

# 27. Important Indexes

Recommended indexes:

``` sql
CREATE INDEX idx_places_location
ON places
USING GIST(location);

CREATE INDEX idx_barriers_location
ON barriers
USING GIST(location);

CREATE INDEX idx_route_segments_geometry
ON route_segments
USING GIST(geometry);

CREATE INDEX idx_assistance_points_location
ON assistance_points
USING GIST(location);

CREATE INDEX idx_accessibility_place
ON accessibility_records(place_id);

CREATE INDEX idx_barriers_status
ON barriers(status);

CREATE INDEX idx_barriers_expires
ON barriers(expires_at);

CREATE INDEX idx_reports_status
ON reports(status);

CREATE INDEX idx_evidence_report
ON evidence(report_id);
```

Actual indexes should be validated against query patterns.

------------------------------------------------------------------------

# 28. Spatial Query Patterns

Common query:

``` text
Find active barriers within 500m of route.
```

Use PostGIS spatial functions rather than loading all rows into
application memory.

Conceptually:

``` text
route geometry
      ↓
spatial intersection / distance query
      ↓
candidate barriers
      ↓
active + verified filtering
```

------------------------------------------------------------------------

# 29. Data Freshness

Important records should include:

``` text
created_at
updated_at
last_verified_at
expires_at
```

For temporary information:

``` text
active until
```

must be explicit where appropriate.

Do not keep a temporary condition active indefinitely without
revalidation.

------------------------------------------------------------------------

# 30. Trust Calculation

Trust should be application logic.

Possible conceptual inputs:

``` text
source quality
+
verification status
+
recency
+
evidence
+
number of independent reports
```

Output:

``` text
HIGH
MEDIUM
LOW
UNKNOWN
```

The exact formula should be versioned and tested.

------------------------------------------------------------------------

# 31. Accessibility Match Calculation

Route scoring can consume:

``` text
traveller preferences
+
route properties
+
accessibility records
+
active barriers
+
current conditions
```

Example conceptual output:

``` json
{
  "score": 87,
  "level": "HIGH",
  "reasons": [
    "step_free",
    "low_walking_distance",
    "no_active_verified_barriers"
  ],
  "warnings": [
    "elevator_status_unknown"
  ]
}
```

The database stores the result where useful, but the scoring engine
remains the authoritative calculator.

------------------------------------------------------------------------

# 32. Data Ownership

Recommended ownership:

``` text
users
→ Account service

accessibility_profiles
→ Profile service

places
→ Place service

accessibility_records
→ Accessibility service

barriers
→ Barrier service

reports
→ Reporting service

evidence
→ Evidence service

verifications
→ Verification service

routes
→ Route service

itineraries
→ Trip service

weather
→ Context service
```

------------------------------------------------------------------------

# 33. Deletion and Retention

Before production, define retention policies for:

-   route requests;
-   location history;
-   uploaded evidence;
-   AI logs;
-   audit logs;
-   account data.

Avoid retaining precise historical location data indefinitely.

Important verification/audit records may require longer retention for
accountability.

------------------------------------------------------------------------

# 34. Demo Seed Dataset

For SIH, prepare deterministic seed data containing:

``` text
10 places
30+ accessibility records
5+ assistance points
8+ barriers
10+ evidence records
verification history
3 traveller profiles
5 route scenarios
weather snapshots
crowd observations
```

At least one scenario must demonstrate:

``` text
Route A
→ verified barrier
→ route recalculation
→ Route B
```

------------------------------------------------------------------------

# 35. S21 Extension Fields

Do not pollute the S20 core unnecessarily.

Potential future tables:

``` text
sustainability_metrics
community_benefits
visitor_pressure
local_businesses
environmental_observations
```

Connect through:

``` text
place_id
```

------------------------------------------------------------------------

# 36. S22 Extension Fields

Potential future tables:

``` text
copilot_sessions
copilot_messages
recommendation_events
itinerary_versions
source_citations
```

These should be introduced when the S22 features are actually
implemented.

------------------------------------------------------------------------

# 37. AI Interaction Boundary

The AI must never receive unrestricted database access.

Preferred:

``` text
AI
 ↓
Tool
 ↓
Service
 ↓
Repository
 ↓
Database
```

Example:

``` text
get_accessibility(place_id)
```

not:

``` text
SELECT * FROM accessibility_records
```

------------------------------------------------------------------------

# 38. Data Model Definition of Done

Before implementation is considered complete:

-   [ ] migrations exist;
-   [ ] all core tables are defined;
-   [ ] foreign keys exist;
-   [ ] enums are defined;
-   [ ] spatial columns are correct;
-   [ ] spatial indexes exist where required;
-   [ ] timestamps are consistent;
-   [ ] verification is auditable;
-   [ ] evidence metadata is secure;
-   [ ] unknown accessibility is represented explicitly;
-   [ ] seed data exists;
-   [ ] S20 core is independent of S21/S22 extensions.

------------------------------------------------------------------------

# 39. Final Data Principle

## Store facts, provenance, uncertainty, and history.

AccessPath should never reduce complex accessibility information to:

``` text
Accessible: Yes/No
```

Instead, the data model should support:

``` text
What?
Where?
When?
Source?
Evidence?
Verified by whom?
How recently?
How confident?
Is it temporary?
Does it affect this route?
```

That is the foundation for trustworthy accessibility intelligence.
