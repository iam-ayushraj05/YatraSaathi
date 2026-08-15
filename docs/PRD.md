# AccessPath --- S20 Project Requirements Document (PRD)

**Problem Statement:** SOAIDEATHON-S20 --- Accessible Journey Planner
with Real-Time Barrier and Assistance Mapping\
**Project Type:** Software\
**Domain:** Tourism\
**Document Status:** v1.0 --- Initial Product Requirements\
**Primary Goal:** Build a practical, evidence-driven accessibility
intelligence and journey-planning platform for travellers with mobility,
visual, hearing, cognitive, or age-related needs.

------------------------------------------------------------------------

## 1. Product Vision

### Working Product Name

**AccessPath**

### Tagline

**Travel without barriers. Navigate with confidence.**

### Vision

AccessPath helps travellers answer a more useful question than:

> "Is this destination accessible?"

It aims to answer:

> **"How suitable is this journey for my specific needs, under the
> current conditions, and how confident can I be in that information?"**

The platform combines traveller accessibility preferences, route
information, accessibility facilities, temporary barrier reports,
weather, assistance availability, evidence, verification status, and
AI-powered planning.

The AI must be grounded in verified application data rather than
inventing accessibility facts.

------------------------------------------------------------------------

# 2. S20 Problem Alignment

The S20 statement asks for a tourism planner for travellers with
mobility, visual, hearing, cognitive, or age-related needs. It calls for
recommendations based on verified accessibility information, crowds,
weather, and available assistance, together with the ability for users
and authorized auditors to report temporary barriers using evidence and
confidence ratings.

AccessPath directly addresses these requirements through:

  -----------------------------------------------------------------------
  S20 Requirement                     AccessPath Implementation
  ----------------------------------- -----------------------------------
  Tourism planner                     Personalized destination and
                                      itinerary planner

  Mobility needs                      Wheelchair, walking-distance,
                                      stairs, ramps, elevators, rest
                                      areas

  Visual needs                        Voice-first interaction,
                                      accessibility metadata, navigation
                                      assistance

  Hearing needs                       Visual/text alternatives and clear
                                      alerts

  Cognitive/age-related needs         Simpler routes, rest points, lower
                                      complexity, clear instructions

  Verified accessibility information  Source, timestamp, verification
                                      status, confidence

  Crowds                              Crowd status as a route/destination
                                      factor

  Weather                             Weather-aware recommendations

  Available assistance                Assistance points and facilities

  Temporary barriers                  Real-time/community barrier reports

  Evidence                            Image/evidence attachment

  Confidence ratings                  Trust/confidence score for
                                      accessibility claims

  Authorized auditors                 Auditor verification workflow

  Dynamic recommendations             Route and itinerary recalculation
                                      when conditions change
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Problem Analysis

Tourism information often treats accessibility as a static property. In
reality, accessibility can change because:

-   an elevator stops working;
-   a ramp becomes blocked;
-   construction changes a pathway;
-   a temporary closure occurs;
-   weather makes an outdoor route unsuitable;
-   crowd levels make navigation difficult;
-   an accessible entrance differs from the main entrance;
-   information becomes outdated.

A route can therefore be technically short but practically unsuitable.

AccessPath addresses this by separating:

1.  **Static accessibility information**
2.  **Current conditions**
3.  **Evidence**
4.  **Verification**
5.  **Traveller-specific compatibility**

------------------------------------------------------------------------

# 4. Product Goals

## Primary Goals

1.  Provide personalized accessibility-aware tourism planning.
2.  Represent accessibility as traveller-specific compatibility rather
    than a simple yes/no label.
3.  Detect and incorporate temporary barriers.
4.  Provide evidence, source, freshness, and verification information
    for critical claims.
5.  Recalculate recommendations when important conditions change.
6.  Provide a text and voice interface to the same AI copilot.
7.  Create a practical prototype that can be demonstrated end-to-end.
8.  Maintain a clear path toward deployment by tourism authorities and
    local organizations.

## Secondary Goals

1.  Support multilingual interaction.
2.  Support AI-assisted evidence analysis.
3.  Provide auditor and authority workflows.
4.  Prepare the architecture for future responsible-tourism and
    verified-generative-AI capabilities.

------------------------------------------------------------------------

# 5. Non-Goals for the Initial MVP

The first version will NOT attempt to:

-   map every tourist destination in India;
-   guarantee that a location is accessible;
-   autonomously certify accessibility from photographs;
-   provide medical advice;
-   replace official emergency services;
-   predict crowds with nationwide accuracy;
-   build a full native mobile application before the core web system
    works;
-   integrate every tourism provider;
-   implement every S21/S22 feature.

The MVP will use a focused pilot region/destination cluster with clearly
labelled data sources.

------------------------------------------------------------------------

# 6. Target Users

## 6.1 Travellers with Mobility Needs

Examples:

-   wheelchair users;
-   travellers who avoid stairs;
-   users with limited walking distance;
-   elderly travellers;
-   people using mobility aids.

Needs:

-   step-free routes;
-   ramps;
-   elevators;
-   accessible toilets;
-   parking;
-   rest points;
-   shorter or lower-effort routes.

------------------------------------------------------------------------

## 6.2 Travellers with Visual Needs

Needs:

-   voice-first interaction;
-   clear textual descriptions;
-   accessible route information;
-   assistance points;
-   high-contrast UI;
-   screen-reader-friendly controls.

------------------------------------------------------------------------

## 6.3 Travellers with Hearing Needs

Needs:

-   visual alerts;
-   text alternatives;
-   clear written instructions;
-   visible status changes;
-   non-audio-only notifications.

------------------------------------------------------------------------

## 6.4 Travellers with Cognitive or Age-Related Needs

Needs:

-   simple instructions;
-   predictable routes;
-   fewer complicated transfers;
-   rest areas;
-   lower crowd preference;
-   clear itinerary presentation.

------------------------------------------------------------------------

## 6.5 Caregivers and Families

A family member may plan a journey for another traveller.

The platform should allow a traveller profile to be used while planning
on behalf of someone else.

------------------------------------------------------------------------

## 6.6 Accessibility Auditors

Authorized auditors:

-   review reports;
-   inspect evidence;
-   verify or reject claims;
-   update verification status;
-   provide confidence assessments.

------------------------------------------------------------------------

## 6.7 Tourism Authorities / Venue Authorities

Authorities can:

-   maintain official accessibility records;
-   verify facilities;
-   update temporary closures;
-   manage official information;
-   monitor accessibility issues.

------------------------------------------------------------------------

# 7. Product Principles

## Principle 1 --- Accessibility First

Accessibility is not an extra filter added at the end. It is part of the
core planning algorithm.

## Principle 2 --- Evidence Before Confidence

Critical accessibility claims should have:

-   source;
-   timestamp;
-   verification state;
-   evidence where available.

## Principle 3 --- AI Does Not Invent Facts

The AI must not fabricate:

-   opening hours;
-   accessibility facilities;
-   barriers;
-   route availability;
-   safety conditions;
-   official claims.

If reliable information is unavailable, it must say so.

## Principle 4 --- AI-Assisted Does Not Mean Officially Verified

Computer vision or LLM analysis can identify a potential issue, but
official accessibility status should require the appropriate
human/authority verification workflow.

## Principle 5 --- Dynamic Information Has an Expiry

Temporary conditions should have timestamps and, where appropriate,
expiry/revalidation rules.

## Principle 6 --- Voice Is an Accessibility Interface

Voice is not merely a novelty feature. It is an alternative interaction
method for users who benefit from hands-free or conversational access.

------------------------------------------------------------------------

# 8. Core Features

## 8.1 Traveller Accessibility Profile

Users can specify relevant preferences such as:

-   mobility assistance;
-   wheelchair use;
-   stair avoidance;
-   maximum preferred walking distance;
-   need for accessible restroom;
-   preference for rest areas;
-   visual assistance preference;
-   hearing-related communication preference;
-   preference for simpler routes;
-   crowd preference.

The system should collect only information necessary for providing the
requested functionality.

------------------------------------------------------------------------

## 8.2 Destination Discovery

Users can:

-   search destinations;
-   filter by accessibility compatibility;
-   view accessibility summaries;
-   compare destinations;
-   view current barriers;
-   view facilities;
-   view confidence and verification status.

------------------------------------------------------------------------

## 8.3 Accessibility Compatibility Score

Instead of a universal "accessible" label, the platform calculates a
compatibility score for the active traveller profile.

Example:

``` text
Traveller:
Wheelchair user
Avoid stairs
Maximum preferred walking distance: 1 km

Destination:
Step-free entrance: Yes
Ramp: Verified
Elevator: Verified
Accessible toilet: Yes
Active barrier: None
Walking distance: 600 m

Compatibility: 92%
Confidence: 88%
```

The score is an application-level decision-support indicator, not a
medical or legal accessibility certification.

------------------------------------------------------------------------

## 8.4 Accessibility-Aware Route Planning

The platform should compare route candidates based on:

-   stairs;
-   step-free access;
-   ramps;
-   elevators;
-   walking distance;
-   surface/path information when available;
-   active barriers;
-   crowd conditions;
-   weather;
-   assistance availability;
-   traveller preferences.

The system should be able to recommend a slightly longer route when it
is significantly more suitable.

------------------------------------------------------------------------

## 8.5 Barrier Reporting

Users can report temporary problems such as:

-   blocked ramp;
-   broken elevator;
-   inaccessible entrance;
-   construction;
-   narrow/blocked pathway;
-   damaged pavement;
-   excessive crowd;
-   temporary closure;
-   missing assistance;
-   other accessibility problems.

A report should contain:

-   location;
-   category;
-   description;
-   timestamp;
-   optional image/evidence;
-   reporter role;
-   status;
-   confidence.

------------------------------------------------------------------------

## 8.6 Evidence Management

Evidence may include:

-   photographs;
-   authority records;
-   auditor observations;
-   structured facility records.

Evidence should be associated with a claim/report and retain:

-   source;
-   timestamp;
-   description;
-   verification state.

------------------------------------------------------------------------

## 8.7 AI-Assisted Evidence Analysis

An image model may analyze an uploaded image for potential accessibility
issues.

Example output:

``` json
{
  "possible_barrier": true,
  "type": "pathway_obstruction",
  "severity": "medium",
  "confidence": 0.88
}
```

This is an AI-assisted observation, not final certification.

------------------------------------------------------------------------

## 8.8 Verification Workflow

Report lifecycle:

``` text
SUBMITTED
    ↓
AI/automated validation
    ↓
PENDING REVIEW
    ↓
VERIFIED / REJECTED / DISPUTED
    ↓
ACTIVE / RESOLVED / EXPIRED
```

Authorized auditors and authorities can review reports.

------------------------------------------------------------------------

## 8.9 Trust and Confidence

Critical information should display:

-   source type;
-   verification status;
-   last verified time;
-   evidence availability;
-   confidence;
-   freshness.

Possible source types:

``` text
Official Authority
Verified Auditor
Community Report
AI-Assisted Detection
Imported Dataset
```

------------------------------------------------------------------------

## 8.10 Weather-Aware Planning

Weather can affect suitability.

Example:

``` text
Rain forecast
    ↓
Outdoor route suitability decreases
    ↓
Covered/indoor alternatives receive higher score
```

Weather should be treated as a planning signal, not as an absolute
safety guarantee.

------------------------------------------------------------------------

## 8.11 Crowd-Aware Planning

Crowd information can affect:

-   destination ranking;
-   route ranking;
-   itinerary timing;
-   suitability for users who prefer lower crowd levels.

For the MVP, crowd information can come from pilot/demo data, user
reports, event information, or available legitimate data sources.

------------------------------------------------------------------------

## 8.12 Assistance Mapping

Map available assistance such as:

-   help desks;
-   accessible entrances;
-   assistance counters;
-   accessible parking;
-   rest areas;
-   toilets;
-   elevators;
-   emergency assistance points where appropriate.

------------------------------------------------------------------------

# 9. AI Travel Copilot

The AI Travel Copilot is the intelligence layer of AccessPath.

It should support:

-   natural-language travel planning;
-   accessibility-aware destination search;
-   route comparison;
-   itinerary generation;
-   barrier explanation;
-   alternative recommendations;
-   weather-aware changes;
-   evidence explanations.

The copilot should use application tools rather than relying only on
free-form LLM knowledge.

### Example

User:

> "Plan a four-hour trip in Puri. I use a wheelchair and want to avoid
> stairs."

The copilot:

1.  reads the accessibility profile;
2.  searches candidate places;
3.  retrieves accessibility data;
4.  checks active barriers;
5.  checks weather;
6.  considers crowd information;
7.  scores destinations/routes;
8.  creates an itinerary;
9.  explains the evidence behind important recommendations.

------------------------------------------------------------------------

# 10. AI Tool Layer

The AI may have controlled tools such as:

``` text
search_places()
get_place_accessibility()
find_accessible_route()
get_active_barriers()
get_facilities()
get_weather()
get_crowd_status()
find_alternative_destination()
create_itinerary()
get_evidence()
report_barrier()
```

Tools must return structured data.

The LLM should explain tool results rather than inventing missing
information.

------------------------------------------------------------------------

# 11. Voice Copilot

Voice is an interface to the same Accessibility AI Copilot.

It is NOT a second independent AI brain.

Architecture:

``` text
User Speech
    ↓
LiveKit
    ↓
Speech-to-Text
    ↓
Accessibility AI Copilot
    ↓
Application Tools
    ↓
Accessibility Engine
    ↓
AI Response
    ↓
Text-to-Speech
    ↓
User
```

The voice interface should support:

-   route requests;
-   accessibility questions;
-   itinerary planning;
-   barrier questions;
-   destination comparison;
-   weather questions;
-   alternative route requests.

The system should also provide a text fallback.

------------------------------------------------------------------------

# 12. Example Voice Interaction

User:

> "Find me an accessible route to the museum."

System:

``` text
1. Identify active traveller profile.
2. Call route tool.
3. Check accessibility constraints.
4. Check active barriers.
5. Return route candidates.
6. Explain recommended route.
```

Example response:

> "I found a 1.4 kilometre route with no reported stairs. The ramp at
> the entrance was verified recently. There is another route, but its
> accessibility information is older."

------------------------------------------------------------------------

# 13. Explainable Recommendations

Whenever practical, AI recommendations should provide a "Why?" section.

Example:

``` text
Why this route?

✓ No stairs
✓ Step-free entrance
✓ Accessible restroom nearby
✓ No active verified barrier
✓ Lower crowd level

Evidence:
Verified auditor record
User report
Weather data

Confidence: 91%
```

------------------------------------------------------------------------

# 14. Main User Journey

``` text
Landing
  ↓
Create Profile
  ↓
Set Accessibility Preferences
  ↓
Search Destination
  ↓
View Accessibility Summary
  ↓
Plan Route
  ↓
Compare Route Options
  ↓
Select Recommended Route
  ↓
View Evidence/Confidence
  ↓
Start Journey
  ↓
Receive Dynamic Updates
```

------------------------------------------------------------------------

# 15. Barrier User Journey

``` text
User sees barrier
  ↓
Open Report
  ↓
Select Barrier Type
  ↓
Add Description
  ↓
Upload Evidence
  ↓
Location Captured
  ↓
AI-Assisted Analysis
  ↓
Submit
  ↓
Auditor Review
  ↓
Verified
  ↓
Route Engine Updated
```

------------------------------------------------------------------------

# 16. Auditor Journey

``` text
Auditor Login
  ↓
Pending Reports
  ↓
Open Report
  ↓
Review Location
  ↓
Review Evidence
  ↓
Review AI Analysis
  ↓
Verify / Reject / Dispute
  ↓
Add Confidence
  ↓
Publish Status
```

------------------------------------------------------------------------

# 17. Main Screens

## Traveller

1.  Landing page
2.  Login/register
3.  Accessibility onboarding
4.  Home/map
5.  Destination details
6.  Accessibility details
7.  Route planner
8.  Route comparison
9.  AI copilot
10. Voice copilot
11. Itinerary
12. Barrier report
13. Report status
14. Settings

## Auditor

1.  Auditor dashboard
2.  Pending reports
3.  Report details
4.  Evidence viewer
5.  Verification workflow
6.  Verification history

## Authority/Admin

1.  Overview dashboard
2.  Places
3.  Accessibility records
4.  Barrier map
5.  Reports
6.  Analytics
7.  Users/roles
8.  Audit logs

------------------------------------------------------------------------

# 18. Functional Requirements

## FR-01 --- Profile

The system shall allow a user to create and edit an accessibility
preference profile.

## FR-02 --- Destination Search

The system shall allow users to search and discover tourism
destinations.

## FR-03 --- Accessibility Information

The system shall display relevant accessibility facilities and
restrictions.

## FR-04 --- Personalized Route

The system shall calculate/recommend routes according to the active
traveller profile.

## FR-05 --- Dynamic Barriers

The system shall incorporate active verified temporary barriers into
recommendations.

## FR-06 --- Reporting

The system shall allow eligible users to report temporary accessibility
barriers.

## FR-07 --- Evidence

The system shall allow reports to include supporting evidence.

## FR-08 --- Verification

The system shall provide an authorized verification workflow.

## FR-09 --- Confidence

The system shall associate important claims with a confidence/trust
representation.

## FR-10 --- Weather

The system shall retrieve weather information and use it as a planning
factor.

## FR-11 --- Crowd

The system shall support crowd-level information as a planning factor.

## FR-12 --- Assistance

The system shall display available accessibility assistance/facilities.

## FR-13 --- AI Copilot

The system shall support natural-language travel planning grounded in
application data.

## FR-14 --- Voice

The system shall provide a voice interface to the same AI copilot.

## FR-15 --- Explainability

The system shall provide the basis/source for important AI-generated
recommendations where available.

## FR-16 --- Roles

The system shall distinguish traveller, auditor, authority, and
administrator permissions.

------------------------------------------------------------------------

# 19. Non-Functional Requirements

## Performance

-   Map and primary UI should load quickly under normal network
    conditions.
-   API responses should have reasonable latency.
-   Long-running AI operations should show progress/loading state.
-   External API failures should not crash the entire application.

## Reliability

The application must gracefully handle:

-   routing API failure;
-   weather API failure;
-   AI timeout;
-   voice connection failure;
-   database failure;
-   invalid user input.

## Security

-   API keys must never be exposed to the browser.
-   Secrets must use environment variables.
-   User input must be validated.
-   Role-based authorization must be enforced server-side.
-   File uploads must be validated.
-   Rate limiting should be applied to abuse-prone endpoints.
-   Audit actions should be logged.

## Accessibility

The application itself should support:

-   keyboard navigation;
-   visible focus states;
-   semantic HTML;
-   screen-reader-friendly labels;
-   sufficient contrast;
-   text alternatives;
-   non-color-only status communication;
-   responsive layouts;
-   readable typography.

------------------------------------------------------------------------

# 20. Privacy Requirements

The system should collect the minimum information necessary.

Accessibility preferences may be sensitive in context, so:

-   do not expose them publicly;
-   restrict access to authorized services/users;
-   do not store unnecessary personal information;
-   provide clear deletion/editing mechanisms where applicable;
-   do not use profile data for unrelated purposes.

------------------------------------------------------------------------

# 21. Proposed Technical Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   MapLibre GL JS

## Backend

-   Python
-   FastAPI

## Database

-   PostgreSQL
-   PostGIS

## AI

-   Gemini API
-   Tool/function calling
-   Retrieval/structured application data
-   Vision-capable model where appropriate

## Voice

-   LiveKit Agents
-   Speech-to-text provider
-   Murf TTS
-   Gemini

## Maps

-   OpenStreetMap data
-   MapLibre
-   OSM-compatible routing service

## Weather

-   Open-Meteo or another approved weather service

## Storage

-   Object storage/Supabase Storage/appropriate cloud storage

------------------------------------------------------------------------

# 22. MVP Data Scope

To keep the project practical, the initial demonstration should use a
focused geographic area.

Recommended pilot:

-   5--10 major tourist locations;
-   5--10 facilities per location where practical;
-   20--30 accessibility records;
-   10--20 barrier scenarios;
-   several verified/unverified examples;
-   weather integration;
-   sample crowd states.

Any synthetic/demo data must be clearly identified as demonstration
data.

------------------------------------------------------------------------

# 23. MVP Definition

The MVP is complete when a user can:

1.  create an accessibility profile;
2.  select a destination;
3.  view accessibility information;
4.  request an accessibility-aware route;
5.  see route alternatives;
6.  see active barriers;
7.  understand confidence/source information;
8.  submit a barrier report;
9.  have an authorized reviewer verify the report;
10. see the recommendation change after a verified barrier;
11. ask the AI copilot for a personalized itinerary;
12. perform the same core interaction through voice.

------------------------------------------------------------------------

# 24. Advanced Features

After the MVP:

-   AI-assisted image barrier detection;
-   multilingual voice;
-   richer crowd intelligence;
-   authority integrations;
-   destination accessibility digital twin;
-   predictive accessibility issues;
-   offline-friendly experience;
-   mobile application;
-   hotel/venue accessibility data;
-   transport-hub accessibility;
-   event accessibility planning.

------------------------------------------------------------------------

# 25. S21 Future Integration

S21 can extend AccessPath with responsible/regenerative tourism
intelligence.

Potential future data:

-   visitor flows;
-   local purchases;
-   waste;
-   water use;
-   biodiversity pressure;
-   community benefits.

The system could eventually recommend:

> "This destination has similar accessibility but lower visitor pressure
> and stronger local-community benefit."

S21 is a future extension, not a requirement for the S20 MVP.

------------------------------------------------------------------------

# 26. S22 Future Integration

S22 capabilities can be incorporated through the same AI architecture:

-   multilingual generative travel planning;
-   dynamic itineraries;
-   verified source-backed facts;
-   crowd-aware recommendations;
-   sensitive-location avoidance;
-   locally owned service recommendations;
-   explicit uncertainty;
-   protection against fabricated operating hours and safety claims.

The S22 capabilities should remain modular so they do not weaken S20's
focused accessibility purpose.

------------------------------------------------------------------------

# 27. Security Model

Roles:

``` text
TRAVELLER
AUDITOR
AUTHORITY
ADMIN
```

### Traveller

Can:

-   manage own profile;
-   search;
-   plan journeys;
-   submit reports;
-   view public information.

### Auditor

Can:

-   review assigned/pending reports;
-   inspect evidence;
-   verify/reject/dispute;
-   record verification.

### Authority

Can:

-   manage official destination information;
-   verify official records;
-   manage facility information.

### Admin

Can:

-   manage system configuration;
-   manage roles;
-   monitor activity;
-   review audit logs.

------------------------------------------------------------------------

# 28. Data Trust Model

Every important accessibility claim should be evaluated using factors
such as:

``` text
Source reliability
+ Evidence quality
+ Freshness
+ Verification status
+ Independent corroboration
```

The final confidence indicator must be clearly labelled as a
system-generated confidence measure and not presented as an official
certification.

------------------------------------------------------------------------

# 29. Error Handling

Examples:

### Routing unavailable

Show:

> "Route service is temporarily unavailable. Existing accessibility
> information is still available."

### Weather unavailable

Show:

> "Current weather information is unavailable. Weather has not been used
> in this recommendation."

### AI unavailable

Allow normal map/search functionality to continue.

### Voice unavailable

Provide text interaction.

### Low-confidence data

Do not hide uncertainty.

Show:

> "Accessibility information is outdated or unverified."

------------------------------------------------------------------------

# 30. AI Safety and Grounding Rules

The AI must:

-   use tools for current application information;
-   cite/show sources for critical facts where available;
-   distinguish verified facts from reports;
-   distinguish AI-generated observations from verified information;
-   state uncertainty;
-   never invent accessibility facilities;
-   never invent barriers;
-   never claim an image proves accessibility;
-   never claim a route is guaranteed safe;
-   avoid medical conclusions;
-   avoid pretending to be an authority.

------------------------------------------------------------------------

# 31. Success Metrics

Prototype-level metrics:

### Accessibility

-   percentage of pilot destinations with structured accessibility
    information;
-   percentage of active barriers with verification status;
-   percentage of recommendations containing source/confidence
    information.

### System

-   route response time;
-   AI response time;
-   voice interaction latency;
-   API error rate.

### User Experience

-   successful journey-planning completion rate;
-   successful barrier-report completion rate;
-   task completion without assistance;
-   user satisfaction during testing.

### Trust

-   percentage of critical claims with freshness metadata;
-   verification turnaround time;
-   number of disputed/rejected reports.

------------------------------------------------------------------------

# 32. Competitive Differentiation

AccessPath should NOT claim:

> "We are the first accessible tourism app."

Instead, the positioning is:

> **AccessPath combines personalized accessibility compatibility,
> dynamic barrier intelligence, evidence/verification, environmental
> conditions, and a voice-first AI copilot in one journey-planning
> workflow.**

The strongest differentiators are:

1.  Traveller-specific compatibility rather than binary accessibility.
2.  Dynamic temporary barrier intelligence.
3.  Evidence + freshness + verification + confidence.
4.  Human verification combined with AI assistance.
5.  AI grounded in application data.
6.  Voice as an accessibility interface.
7.  Route recommendations that can change when accessibility conditions
    change.

------------------------------------------------------------------------

# 33. Demonstration Scenario

The primary SIH demo should follow one realistic journey.

### Step 1

Traveller selects:

``` text
Wheelchair
Avoid stairs
Moderate walking distance
```

### Step 2

User asks:

> "Plan a four-hour accessible trip."

### Step 3

AI generates an itinerary.

### Step 4

Map shows multiple route options.

### Step 5

A temporary ramp obstruction is reported.

### Step 6

Auditor verifies the report.

### Step 7

The original route score decreases.

### Step 8

The system recommends an alternative.

### Step 9

Weather changes/forecast indicates rain.

### Step 10

The system prefers a more suitable route.

### Step 11

User asks through voice:

> "Why did you change my route?"

### Step 12

Voice copilot explains the verified barrier, weather factor, and
confidence.

This should be the main product story.

------------------------------------------------------------------------

# 34. USP Statement

## Short USP

> **Personalized, evidence-driven accessibility intelligence for
> real-world tourism journeys.**

## SIH Pitch Version

> **AccessPath transforms accessibility from a static label into a
> dynamic, traveller-specific intelligence layer. It combines verified
> accessibility information, temporary barrier reports, evidence,
> confidence, weather, crowd conditions, and assistance availability to
> generate explainable journey recommendations. Users can interact
> through text or a voice-first AI copilot, while authorized auditors
> help maintain trust in the underlying data.**

------------------------------------------------------------------------

# 35. Future Vision

Long term, AccessPath can evolve from a tourism planner into an:

## India Accessibility Digital Intelligence Layer

Potential integrations:

-   tourism authorities;
-   museums;
-   heritage sites;
-   hotels;
-   airports;
-   railway stations;
-   smart cities;
-   events;
-   public infrastructure.

The long-term system can continuously represent:

``` text
Where can I go?
How can I get there?
What barriers exist now?
What assistance is available?
How trustworthy is the information?
What is the best option for me?
```

------------------------------------------------------------------------

# 36. Definition of Done --- Product

The S20 MVP is considered complete only when:

-   [ ] S20 requirements are demonstrably covered.
-   [ ] Traveller accessibility profile works.
-   [ ] Pilot destination data exists.
-   [ ] Map works.
-   [ ] Accessibility-aware routing works.
-   [ ] Temporary barriers can be reported.
-   [ ] Evidence can be attached.
-   [ ] Verification workflow works.
-   [ ] Confidence/freshness is visible.
-   [ ] Verified barriers affect recommendations.
-   [ ] Weather affects planning where data is available.
-   [ ] AI copilot uses application tools.
-   [ ] Voice interface uses the same underlying intelligence.
-   [ ] Errors have usable fallback states.
-   [ ] API keys are protected.
-   [ ] Role permissions work.
-   [ ] Main UI is accessibility-conscious.
-   [ ] End-to-end demo works reliably.

------------------------------------------------------------------------

# 37. What We Build First

The project must be implemented incrementally.

Initial implementation order:

``` text
1. Repository + documentation
2. Frontend/backend foundation
3. Database
4. Pilot accessibility dataset
5. Destination APIs
6. Accessibility profile
7. Accessibility compatibility engine
8. Map
9. Route engine
10. Barrier reporting
11. Verification
12. Trust/confidence
13. Weather
14. AI copilot
15. Voice interface
16. AI-assisted evidence analysis
17. Auditor/admin dashboards
18. Testing
19. Deployment
20. SIH presentation/demo
```

No later feature should be allowed to destabilize the core S20
journey-planning workflow.

------------------------------------------------------------------------

# 38. Project Decision

The project will be developed as:

> **One accessibility intelligence platform with one AI copilot and
> multiple interfaces.**

The interfaces are:

``` text
Web/Text
Voice
Map/Visual
```

The intelligence remains centralized:

``` text
Accessibility Engine
+
Route Engine
+
Trust Engine
+
AI Copilot
```

This prevents duplicate AI systems and keeps the architecture
maintainable.

------------------------------------------------------------------------

## Document Control

**Version:** 1.0\
**Status:** Approved for architecture planning\
**Next Document:** `ARCHITECTURE.md`\
**Next Development Milestone:** Technical architecture and repository
structure
