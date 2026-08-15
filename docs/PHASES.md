# AccessPath --- Development Phases & Execution Roadmap

**Project:** S20 --- Accessible Journey Planner with Real-Time Barrier
and Assistance Mapping\
**Document:** Development Roadmap\
**Version:** 1.0\
**Purpose:** Convert the PRD and architecture into an executable build
plan.

------------------------------------------------------------------------

# 1. How to Use This Roadmap

Build the project sequentially.

Do not attempt to build all features at once.

Each phase has:

-   Goal
-   Deliverables
-   Tasks
-   Dependencies
-   Acceptance criteria
-   Testing
-   Exit condition

A phase is complete only when its exit condition is satisfied.

------------------------------------------------------------------------

# 2. Overall Roadmap

``` text
PHASE 0  Project Foundation
    ↓
PHASE 1  App Shell + Design System
    ↓
PHASE 2  Database + Core Data
    ↓
PHASE 3  Accessibility Profiles
    ↓
PHASE 4  Places + Accessibility Intelligence
    ↓
PHASE 5  Map + Route Planning
    ↓
PHASE 6  Barrier Reporting + Evidence
    ↓
PHASE 7  Verification + Trust
    ↓
PHASE 8  Real-Time Context
    ↓
PHASE 9  AI Travel Copilot
    ↓
PHASE 10 Voice Agent
    ↓
PHASE 11 AI Vision
    ↓
PHASE 12 Auditor / Authority Dashboard
    ↓
PHASE 13 S21/S22 Extension Layer
    ↓
PHASE 14 Testing + Security + Polish
    ↓
PHASE 15 SIH Demo + Deployment
```

The MVP can be demonstrated after approximately:

``` text
Phase 0 → Phase 7
```

AI + voice make the project significantly stronger:

``` text
Phase 9 → Phase 10
```

Advanced differentiation:

``` text
Phase 11 → Phase 13
```

------------------------------------------------------------------------

# 3. Phase 0 --- Project Foundation

## Goal

Create a clean repository and development environment.

## Tasks

-   initialize Git;
-   create repository structure;
-   create frontend;
-   create backend;
-   create docs folder;
-   configure environment variables;
-   create `.gitignore`;
-   create `.env.example`;
-   configure basic linting;
-   configure formatting;
-   create README;
-   create development setup instructions.

## Structure

``` text
accesspath/
├── docs/
├── frontend/
├── backend/
├── ai/
├── data/
├── tests/
├── scripts/
├── README.md
├── .env.example
├── .gitignore
└── docker-compose.yml
```

## Acceptance Criteria

-   frontend starts;
-   backend starts;
-   Git works;
-   environment configuration works;
-   no secrets are committed.

## Exit Condition

A fresh clone can be configured and started using documented commands.

------------------------------------------------------------------------

# 4. Phase 1 --- App Shell + Design System

## Goal

Build the visual foundation before adding complex logic.

## Screens

Create:

``` text
Landing
Login / Demo Entry
Dashboard
Explore
Destination
Route Planner
AI Copilot
Reports
Profile
Auditor
Settings
```

## UI Components

Create reusable:

``` text
Button
Card
Modal
Input
Select
Badge
Tabs
Toast
Drawer
Map container
Status indicator
Confidence badge
Accessibility badge
```

## Design Principles

-   accessible contrast;
-   readable typography;
-   responsive layout;
-   clear hierarchy;
-   keyboard support;
-   mobile-friendly controls.

## Acceptance Criteria

Every major page can be navigated.

## Exit Condition

A polished clickable frontend shell exists.

------------------------------------------------------------------------

# 5. Phase 2 --- Database + Core Data

## Goal

Create the foundation for real application data.

## Database

Use:

``` text
PostgreSQL
+
PostGIS
```

## Initial Tables

``` text
users
accessibility_profiles
places
facilities
accessibility_records
barriers
evidence
verifications
route_requests
routes
itineraries
itinerary_stops
weather_snapshots
crowd_observations
assistance_points
audit_logs
```

## Tasks

-   configure database;
-   configure migrations;
-   create models;
-   create indexes;
-   add geospatial columns;
-   create seed data;
-   create repository/service layer.

## Seed Data

For the demo, create a small realistic tourism dataset.

Example:

``` text
5–10 destinations
10–30 facilities
5–10 accessibility records
several assistance points
sample barriers
```

Do not label seed records as official live data.

## Acceptance Criteria

Database can be created from scratch.

## Exit Condition

Seed script populates the complete MVP dataset.

------------------------------------------------------------------------

# 6. Phase 3 --- Accessibility Profiles

## Goal

Let travellers describe their accessibility requirements.

## Profile Inputs

Examples:

``` text
Mobility
Wheelchair
Limited walking
Step-free preference

Visual
Low vision
Screen-reader preference
High contrast

Hearing
Hearing assistance
Visual alerts

Cognitive
Simplified instructions
Reduced complexity
Flexible pacing

Age-related
Reduced walking
Frequent rest
Lower route complexity
```

Avoid forcing users to disclose more personal information than
necessary.

## Backend

Create:

``` text
POST /api/v1/profiles
GET /api/v1/profiles/{id}
PUT /api/v1/profiles/{id}
```

## Frontend

Build:

``` text
Onboarding
Profile editor
Quick preference selector
```

## Acceptance Criteria

A profile can be created and retrieved.

## Exit Condition

The route engine can consume a profile.

------------------------------------------------------------------------

# 7. Phase 4 --- Places + Accessibility Intelligence

## Goal

Create trustworthy destination information.

## Place Page

Display:

``` text
Name
Location
Description
Facilities
Accessibility
Confidence
Verification
Evidence
Last verified
Warnings
```

## Accessibility Data

Examples:

``` text
Step-free entrance
Accessible toilet
Elevator
Accessible parking
Tactile guidance
Hearing assistance
Wheelchair route
Seating/rest areas
```

## Trust UI

Each claim should expose:

``` text
Verified
Community reported
Unverified
Expired
```

## Acceptance Criteria

A place can display structured accessibility information with trust
metadata.

## Exit Condition

Users can compare destinations based on accessibility.

------------------------------------------------------------------------

# 8. Phase 5 --- Map + Route Planning

## Goal

Build the core S20 journey planner.

## Map

Use:

``` text
MapLibre
OpenStreetMap ecosystem
```

## Route Flow

``` text
Origin
 ↓
Destination
 ↓
Candidate Routes
 ↓
Accessibility Constraints
 ↓
Barriers
 ↓
Current Conditions
 ↓
Scoring
 ↓
Ranked Routes
```

## Route Card

Show:

``` text
Recommended
Distance
Duration
Accessibility score
Step-free status
Warnings
Barriers
Confidence
Why recommended
```

## Multiple Routes

Return:

``` text
Best accessibility
Fastest
Lower walking
Alternative
```

where data supports these distinctions.

## Acceptance Criteria

A user can select a profile, choose two points, and receive an
accessibility-aware route recommendation.

## Exit Condition

The core S20 journey-planning loop works.

------------------------------------------------------------------------

# 9. Phase 6 --- Barrier Reporting + Evidence

## Goal

Allow users to report temporary accessibility barriers.

## Report Form

Fields:

``` text
Barrier type
Location
Description
Severity
Observed time
Optional expiry
Evidence
```

## Evidence

Allow:

``` text
Image
Document
Other supported evidence
```

## Workflow

``` text
Report
 ↓
Validation
 ↓
Pending
 ↓
Review
```

## Examples

``` text
Broken elevator
Blocked ramp
Closed accessible entrance
Temporary construction
Obstructed pathway
Unavailable assistance
```

## Acceptance Criteria

A traveller can submit a barrier report and attach valid evidence.

## Exit Condition

Reports appear in the review queue.

------------------------------------------------------------------------

# 10. Phase 7 --- Verification + Trust

## Goal

Turn community reports into useful trusted signals.

## Auditor Flow

``` text
Report
 ↓
Review evidence
 ↓
Accept / Reject / Dispute
 ↓
Verification record
 ↓
Trust state updated
 ↓
Route engine updated
```

## Trust States

``` text
VERIFIED
UNVERIFIED
DISPUTED
EXPIRED
REJECTED
```

## Route Integration

Verified active barriers should influence route recommendations.

## Critical Demo

``` text
Route initially recommends Route A
        ↓
Barrier reported
        ↓
Barrier verified
        ↓
Route A becomes unsuitable
        ↓
Route B recommended
```

This is one of the strongest S20 demonstration moments.

## Exit Condition

A verified barrier can change route recommendations.

------------------------------------------------------------------------

# 11. Phase 8 --- Real-Time Context

## Goal

Add current conditions without making them a single point of failure.

## Weather

Integrate a weather provider.

Use normalized data:

``` text
temperature
rain
wind
condition
forecast time
source
retrieved_at
```

## Crowd

For the MVP:

-   use legitimate external data where available;
-   otherwise use clearly labelled demo observations.

## Assistance

Show:

``` text
Nearby assistance point
Type
Availability
Source
Last updated
```

## Route Integration

Conditions may influence:

``` text
walking preference
outdoor route preference
timing
rest stops
```

## Exit Condition

The route planner can explain when current conditions influenced a
recommendation.

------------------------------------------------------------------------

# 12. Phase 9 --- AI Travel Copilot

## Goal

Turn the application into a verified AI travel assistant.

## User Examples

``` text
"Plan a half-day accessible trip."

"Find a step-free route."

"I use a wheelchair. What can I visit?"

"Why did you choose this route?"

"Show me alternatives with less walking."

"Is the accessibility information verified?"
```

## Architecture

``` text
User
 ↓
AI Copilot
 ↓
Tools
 ├── search_places
 ├── get_profile
 ├── get_accessibility
 ├── find_route
 ├── get_barriers
 ├── get_weather
 ├── get_assistance
 └── get_evidence
```

## AI Rules

The AI must:

-   use tools for current facts;
-   cite/identify sources where appropriate;
-   mark uncertainty;
-   avoid inventing accessibility claims.

## Strong Feature

### "Why this route?"

Return structured reasoning:

``` text
Recommended because:
✓ Step-free
✓ No active verified barriers
✓ Lower walking distance
✓ Accessible facility at destination

Confidence:
High
```

## Exit Condition

The AI can answer travel questions using real application data.

------------------------------------------------------------------------

# 13. Phase 10 --- Voice Agent

## Goal

Add the user's existing voice-agent expertise as a new interface to
AccessPath.

## Architecture

``` text
User Speech
 ↓
LiveKit
 ↓
STT
 ↓
AI Copilot
 ↓
Application Tools
 ↓
LLM Response
 ↓
Murf TTS
 ↓
User
```

## Voice Commands

Examples:

``` text
"Find an accessible route to the museum."

"Is there an elevator?"

"What barriers are reported?"

"Plan my afternoon."

"Why is this route better?"

"Give me the simpler route."
```

## Important Rule

Do NOT copy the old Suraksha AI system into this project.

Reuse the **voice-agent engineering knowledge/pipeline pattern**, but
build a new tourism-specific agent.

The agent identity, system prompt, tools, data, and UX should belong to
AccessPath.

## Exit Condition

A user can complete a meaningful journey-planning task entirely through
voice.

------------------------------------------------------------------------

# 14. Phase 11 --- AI Vision

## Goal

Use uploaded evidence intelligently.

## Flow

``` text
Image
 ↓
Validation
 ↓
Vision Model
 ↓
Potential observation
 ↓
Human verification
 ↓
Trusted claim
```

## Example

Image suggests:

``` text
Ramp appears blocked.
```

System stores:

``` text
AI observation
confidence
timestamp
evidence
```

It must remain:

``` text
AI-assisted / pending verification
```

until authorized verification occurs.

## Exit Condition

Vision assists the verification process without pretending to replace
human verification.

------------------------------------------------------------------------

# 15. Phase 12 --- Auditor / Authority Dashboard

## Goal

Provide a professional interface for managing accessibility reports.

## Dashboard

Show:

``` text
Pending reports
Verified reports
Rejected reports
Disputed reports
Expired reports
High-impact barriers
```

## Map View

Display:

``` text
Barrier locations
Severity
Status
Age
Verification
```

## Analytics

Possible:

``` text
Reports over time
Average verification time
Barrier categories
Most affected areas
Repeated barriers
```

## Exit Condition

An authorized auditor can manage the complete verification lifecycle.

------------------------------------------------------------------------

# 16. Phase 13 --- S21 Extension

## Goal

Add regenerative tourism intelligence without damaging the S20 core.

## Additional Data

``` text
Visitor flow
Local purchases
Waste
Water usage
Biodiversity pressure
Community benefit
```

## Destination Impact Score

Potential model:

``` text
Accessibility
+
Environmental impact
+
Community benefit
+
Crowd pressure
```

Do not make sustainability claims without source/verification metadata.

## User Experience

Example:

``` text
"This accessible alternative also has lower visitor pressure
and stronger local-community participation."
```

This creates a meaningful bridge between S20 and S21.

------------------------------------------------------------------------

# 17. Phase 14 --- S22 Extension

## Goal

Turn AccessPath into a verified generative travel copilot.

## Add

``` text
Multilingual interaction
Dynamic itineraries
Capacity-aware planning
Source citations
Uncertainty labels
Over-tourism avoidance
Local business discovery
Community preferences
```

## Example

User:

> "Plan a two-day accessible trip, avoid crowded attractions, and
> prioritize local businesses."

AI:

``` text
1. Reads profile
2. Searches destinations
3. Checks accessibility
4. Checks capacity/crowd
5. Checks barriers
6. Checks weather
7. Selects local services
8. Builds itinerary
9. Explains every important decision
```

------------------------------------------------------------------------

# 18. Phase 15 --- Testing + Security + Polish

## Functional Testing

Test:

-   authentication;
-   profiles;
-   destination search;
-   accessibility data;
-   route planning;
-   barrier reports;
-   evidence;
-   verification;
-   AI;
-   voice;
-   vision.

## Security

Check:

-   secrets;
-   authentication;
-   authorization;
-   file upload;
-   rate limiting;
-   input validation;
-   API abuse;
-   database access.

## Accessibility

Test:

-   keyboard;
-   screen reader;
-   focus;
-   contrast;
-   responsive layouts;
-   readable map alternatives.

## Performance

Check:

-   initial load;
-   route response;
-   AI response;
-   voice latency;
-   map performance.

------------------------------------------------------------------------

# 19. Phase 16 --- SIH Demo + Deployment

## Goal

Create the most convincing possible demonstration.

## Demo Story

### Step 1 --- Traveller Profile

Select:

``` text
Wheelchair
Step-free
Limited walking
```

### Step 2 --- Destination

Select a tourism destination.

### Step 3 --- Initial Route

Show:

``` text
Route A
Accessible
Verified information
```

### Step 4 --- Live Barrier

Show:

``` text
Elevator temporarily unavailable
```

with evidence.

### Step 5 --- Recalculation

System automatically recommends:

``` text
Route B
```

### Step 6 --- AI Explanation

Ask:

> "Why did you change my route?"

AI explains using verified data.

### Step 7 --- Voice

Ask:

> "What can I visit nearby with less walking?"

Voice agent answers.

### Step 8 --- Trust

Open:

``` text
Why should I trust this?
```

Show:

``` text
Source
Verification
Last updated
Confidence
Evidence
```

### Step 9 --- Future Vision

Briefly demonstrate:

``` text
S21 impact layer
S22 verified generative copilot
```

------------------------------------------------------------------------

# 20. Priority Classification

Not every feature has equal importance.

## P0 --- Must Have

``` text
Frontend
Backend
Database
Accessibility profile
Places
Accessibility records
Map
Route planning
Barrier reporting
Verification
Trust metadata
```

## P1 --- Strong SIH Differentiators

``` text
AI Copilot
Dynamic route updates
Voice agent
Evidence workflow
Auditor dashboard
Weather integration
```

## P2 --- Advanced

``` text
AI vision
Crowd intelligence
Multilingual voice
S21 impact layer
S22 dynamic itinerary
```

## P3 --- Future

``` text
Predictive accessibility
Large-scale analytics
IoT integration
Smart-city integrations
Advanced personalization
```

------------------------------------------------------------------------

# 21. Recommended Build Order for a Solo Developer

If building alone, follow:

``` text
Week/Stage 1
Foundation + UI

Stage 2
Database + Places

Stage 3
Profiles + Accessibility

Stage 4
Map + Routes

Stage 5
Barriers + Verification

Stage 6
AI Copilot

Stage 7
Voice

Stage 8
Polish + Demo
```

Do not start with voice or AI.

The AI becomes valuable only after reliable tools/data exist.

------------------------------------------------------------------------

# 22. What to Build First

The immediate coding target is:

``` text
PHASE 0
```

Start with:

``` text
1. Repository
2. Next.js frontend
3. FastAPI backend
4. PostgreSQL/PostGIS
5. Environment setup
6. Health-check API
7. Base layout
8. Git setup
```

Then move to Phase 1.

------------------------------------------------------------------------

# 23. Definition of Done for the Whole Project

The project is SIH-demo ready when a judge can observe:

``` text
Traveller
 ↓
Accessibility profile
 ↓
Destination
 ↓
Accessibility-aware route
 ↓
Temporary barrier
 ↓
Evidence
 ↓
Verification
 ↓
Route changes
 ↓
AI explains why
 ↓
Voice interaction
 ↓
Trust/source information
```

And the team can clearly explain:

``` text
What problem we solve
Why existing travel planners are insufficient
How our accessibility intelligence works
How we prevent AI hallucinations
How temporary barriers affect routes
How evidence and verification work
Why our voice agent is useful
How the system can scale
How S21/S22 can extend the platform
```

------------------------------------------------------------------------

# 24. Final Milestone Structure

``` text
M0 — Foundation
    Phase 0

M1 — Usable Product
    Phase 1–4

M2 — Core S20
    Phase 5–7

M3 — Intelligent Product
    Phase 8–10

M4 — Advanced Product
    Phase 11–14

M5 — Competition Ready
    Phase 15–16
```

------------------------------------------------------------------------

# 25. Golden Rule

## Do not chase feature count.

A smaller system that genuinely demonstrates:

``` text
Accessibility
+
Real-time barrier awareness
+
Evidence
+
Verification
+
Explainable recommendations
+
Voice interaction
```

is stronger than a giant application containing disconnected features.

Build the core loop first.

Then make it intelligent.

Then make it impressive.
