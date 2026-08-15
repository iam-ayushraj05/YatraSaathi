# AccessPath --- Engineering & AI Rules

**Project:** S20 --- Accessible Journey Planner with Real-Time Barrier
and Assistance Mapping\
**Document:** Engineering Rules\
**Version:** 1.0\
**Purpose:** Single source of truth for human developers and AI coding
agents.

------------------------------------------------------------------------

# 1. Prime Directive

Build the smallest correct system that satisfies the PRD.

Every implementation decision must preserve:

1.  S20 alignment.
2.  Accessibility.
3.  Data trust.
4.  Security.
5.  Maintainability.
6.  Existing working functionality.

If a proposed feature conflicts with these principles, stop and reassess
before coding.

------------------------------------------------------------------------

# 2. Source-of-Truth Hierarchy

When instructions conflict, use this priority:

``` text
1. Current user request
2. PRD.md
3. ARCHITECTURE.md
4. API_CONTRACTS.md
5. DATA_MODEL.md
6. DESIGN.md
7. PHASES.md
8. MEMORY.md
9. Existing implementation
```

If a lower-level document conflicts with a higher-level document, do not
silently choose one.

Report the conflict and update the appropriate document before
implementing a major change.

------------------------------------------------------------------------

# 3. AI Coding Agent Rules

AI coding agents MUST:

-   read relevant documentation before modifying code;
-   inspect existing code before creating new files;
-   reuse existing components/services where appropriate;
-   follow the established folder structure;
-   preserve API contracts;
-   preserve database conventions;
-   explain significant architectural changes;
-   test changes before declaring them complete;
-   update documentation when architecture changes;
-   update `MEMORY.md` after meaningful milestones.

AI coding agents MUST NOT:

-   rewrite the entire project without explicit instruction;
-   delete working functionality to simplify a task;
-   create duplicate services/components;
-   invent external APIs;
-   invent database fields silently;
-   hardcode secrets;
-   install unnecessary dependencies;
-   modify unrelated files;
-   change the tech stack without approval;
-   introduce microservices merely for appearance;
-   fabricate test results;
-   claim a feature works when it has not been tested.

------------------------------------------------------------------------

# 4. Phase Discipline

Only implement the current phase unless the user explicitly requests
otherwise.

Before coding:

``` text
Read:
PRD.md
ARCHITECTURE.md
RULES.md
PHASES.md
Relevant API/DATA/DESIGN documents
```

Then determine:

``` text
Current Phase
Current Task
Files Affected
Dependencies
Acceptance Criteria
Tests Required
```

Do not jump ahead simply because a later feature appears easy.

------------------------------------------------------------------------

# 5. Change Discipline

Before editing:

1.  Identify the smallest set of files required.
2.  Understand their current behavior.
3.  Check whether an existing abstraction already solves the problem.
4.  Check API/data dependencies.
5.  Make the smallest safe change.

After editing:

1.  Run relevant tests.
2.  Run lint/type checks where available.
3.  Check the UI manually when applicable.
4.  Check for regressions.
5.  Update documentation if needed.

------------------------------------------------------------------------

# 6. Architecture Rules

The project starts as a **modular monolith**.

Do NOT introduce microservices unless there is a clear technical reason
and explicit approval.

Core boundaries:

``` text
Frontend
    ↓
FastAPI
    ↓
Domain Services
    ↓
Database / External Adapters
```

AI:

``` text
AI Copilot
    ↓
Approved Tools
    ↓
Application Services
```

Voice:

``` text
Voice Agent
    ↓
Same AI Copilot / Tool Layer
```

The voice system must not duplicate route or accessibility business
logic.

------------------------------------------------------------------------

# 7. Frontend Rules

Use:

-   Next.js
-   React
-   TypeScript
-   established project UI conventions.

Rules:

-   use reusable components;
-   keep business logic out of purely visual components;
-   keep API calls in the API/client layer;
-   avoid duplicated state;
-   handle loading states;
-   handle empty states;
-   handle error states;
-   provide keyboard navigation;
-   provide visible focus states;
-   use semantic HTML;
-   do not communicate important status through color alone.

Do not add a UI library unless the project explicitly approves it.

------------------------------------------------------------------------

# 8. Backend Rules

FastAPI is the application boundary.

Backend responsibilities include:

-   validation;
-   authentication;
-   authorization;
-   business logic;
-   database operations;
-   external service orchestration;
-   AI tool execution;
-   security controls.

The frontend must never bypass the backend to access protected
resources.

------------------------------------------------------------------------

# 9. Database Rules

Use PostgreSQL + PostGIS.

Rules:

-   use migrations for schema changes;
-   never modify production schema manually;
-   use foreign keys where appropriate;
-   use indexes for important query paths;
-   use spatial indexes for spatial queries where appropriate;
-   avoid storing duplicated derived data unless justified;
-   use timestamps consistently;
-   use explicit status fields;
-   preserve auditability for verification-related changes.

Never expose direct database credentials to the frontend or AI model.

------------------------------------------------------------------------

# 10. API Rules

API version:

``` text
/api/v1
```

Rules:

-   validate request bodies;
-   validate query parameters;
-   return consistent errors;
-   use appropriate HTTP status codes;
-   document important endpoints;
-   preserve existing contracts;
-   avoid breaking changes;
-   use explicit response schemas;
-   never expose internal exceptions directly to users.

If an API contract must change:

1.  update `API_CONTRACTS.md`;
2.  update backend;
3.  update frontend/client;
4.  update tests;
5.  document the migration if necessary.

------------------------------------------------------------------------

# 11. External API Rules

External providers must be accessed through adapters.

Do NOT scatter provider-specific calls throughout business logic.

Preferred:

``` text
Business Service
      ↓
Internal Interface
      ↓
Provider Adapter
      ↓
External API
```

This allows the provider to be replaced later.

Every external integration must define:

-   timeout;
-   error behavior;
-   retry policy where appropriate;
-   response normalization;
-   logging policy;
-   rate-limit behavior.

Never assume an external service is always available.

------------------------------------------------------------------------

# 12. API Key & Secret Rules

NEVER:

``` text
NEXT_PUBLIC_SECRET_KEY
hardcoded_api_key
API key in Git
API key in frontend source
API key in screenshots
API key in logs
```

Use environment variables.

Maintain:

``` text
.env
.env.example
```

`.env` must be ignored by Git.

Only safe public configuration may be exposed to the browser.

------------------------------------------------------------------------

# 13. Accessibility Data Rules

Accessibility information is not automatically true because it exists in
the database.

Important claims should carry:

``` text
source
source_type
created_at
last_verified_at
verification_status
confidence
evidence
```

Do not silently convert:

``` text
Unknown → Accessible
```

If information is unavailable, return:

``` text
UNKNOWN
```

or an equivalent explicit state.

------------------------------------------------------------------------

# 14. Trust Rules

The platform must distinguish:

``` text
Official / Verified
Community Report
AI-Assisted
Unverified
Disputed
Expired
Rejected
```

Never display an AI-generated observation as if it were an official
fact.

Never remove uncertainty simply to make the UI look cleaner.

------------------------------------------------------------------------

# 15. AI Rules

The AI is a copilot, not the source of truth.

The AI MAY:

-   interpret user requests;
-   select tools;
-   summarize structured data;
-   compare options;
-   generate itineraries;
-   explain recommendations;
-   ask clarifying questions;
-   communicate uncertainty.

The AI MUST NOT:

-   invent accessibility facilities;
-   invent barriers;
-   invent operating hours;
-   invent route availability;
-   fabricate official verification;
-   fabricate sources;
-   claim current conditions without current data;
-   claim an AI image analysis is a verified fact;
-   provide medical or legal certification;
-   override application permissions.

------------------------------------------------------------------------

# 16. AI Grounding Rules

For current or critical information, the AI should use application
tools.

Examples:

``` text
"What is the current barrier?"
→ get_active_barriers()

"Is this place wheelchair compatible?"
→ get_place_accessibility()

"What's the accessible route?"
→ find_accessible_route()

"What's the weather?"
→ get_weather()
```

The AI should not answer from model memory when the application has a
tool for the requested current information.

If tool data is unavailable:

``` text
Say that the information is unavailable.
Do not guess.
```

------------------------------------------------------------------------

# 17. AI Tool Rules

Each AI tool must have:

-   explicit name;
-   clear description;
-   typed input;
-   typed output;
-   permission rules;
-   error behavior.

Tools should be narrowly scoped.

Bad:

``` text
do_everything()
```

Good:

``` text
find_accessible_route()
get_active_barriers()
get_weather()
get_evidence()
```

Tools should not expose raw database operations to the model.

Bad:

``` text
execute_sql()
```

Good:

``` text
search_places()
```

------------------------------------------------------------------------

# 18. AI Response Rules

For accessibility-critical recommendations, the AI should communicate:

1.  recommendation;
2.  important reasons;
3.  uncertainty when applicable;
4.  source/verification context when useful.

Example structure:

``` text
Recommended route:
Route B

Why:
- No reported stairs
- Verified step-free entrance
- No active verified barrier

Confidence:
High

Note:
The accessibility record was last verified recently.
```

Avoid excessive technical details in normal user responses.

------------------------------------------------------------------------

# 19. Voice Rules

Voice is an interface, not a separate intelligence system.

Architecture:

``` text
Speech
 ↓
STT
 ↓
Same AI Copilot
 ↓
Same Tools
 ↓
Same Backend
 ↓
TTS
```

Do NOT create separate voice-only business logic.

Voice must have a text fallback.

If voice fails:

``` text
Text interaction remains usable.
```

The voice agent should not expose secrets to the client.

------------------------------------------------------------------------

# 20. Route Engine Rules

Route scoring belongs to the application, not the LLM.

The LLM can explain the result.

The route engine must:

-   use traveller preferences;
-   evaluate route constraints;
-   incorporate active barriers;
-   consider available accessibility data;
-   consider relevant current conditions;
-   return reasons for ranking.

Never let an LLM directly decide that a route is physically accessible
without structured application data.

------------------------------------------------------------------------

# 21. Accessibility Scoring Rules

The scoring algorithm must be:

-   deterministic for the same input;
-   versioned;
-   testable;
-   explainable;
-   configurable.

Do not hide the scoring formula inside a prompt.

Example:

``` text
Profile
+
Route
+
Facilities
+
Barriers
+
Current Conditions
        ↓
Accessibility Engine
        ↓
Score + Reasons + Warnings
```

Scores are decision-support indicators, not official certifications.

------------------------------------------------------------------------

# 22. Barrier Rules

A barrier must have a lifecycle.

Example:

``` text
SUBMITTED
→ PENDING_REVIEW
→ VERIFIED
→ ACTIVE
→ RESOLVED
→ EXPIRED
```

Possible alternate outcomes:

``` text
REJECTED
DISPUTED
```

Temporary barriers must not become permanent facts automatically.

Use timestamps and expiration/revalidation where appropriate.

------------------------------------------------------------------------

# 23. Evidence Rules

Evidence uploads must be:

-   permission checked;
-   file-type validated;
-   size limited;
-   stored outside the relational database;
-   linked through metadata;
-   associated with a report/claim.

AI analysis of evidence must be marked as AI-assisted.

AI vision does not automatically verify a report.

------------------------------------------------------------------------

# 24. Verification Rules

Only authorized roles may verify/reject reports.

Verification actions must be auditable.

Store:

``` text
who
what
when
previous state
new state
reason
```

A normal traveller must not be able to mark their own report as
officially verified.

------------------------------------------------------------------------

# 25. Privacy Rules

Collect only what is needed.

Do not expose a user's accessibility profile publicly.

Do not log unnecessary personal information.

Do not store sensitive information in:

-   URLs;
-   client-side logs;
-   analytics events;
-   error messages.

Provide appropriate account/data deletion mechanisms where required by
the final deployment context.

------------------------------------------------------------------------

# 26. Logging Rules

Logs must help debugging without leaking secrets.

Allowed:

``` text
request_id
endpoint
duration
status_code
error_category
service_name
```

Avoid:

``` text
password
token
API key
full private profile
unnecessary uploaded image contents
```

------------------------------------------------------------------------

# 27. Error Handling Rules

Every user-facing operation needs a useful failure state.

Bad:

``` text
Something went wrong.
```

Better:

``` text
Current weather information is temporarily unavailable.
Your route was calculated without weather data.
```

Errors should be:

-   understandable;
-   actionable;
-   non-sensitive;
-   logged appropriately.

Never expose stack traces in production UI.

------------------------------------------------------------------------

# 28. Loading and Empty States

Every asynchronous feature should have:

``` text
Loading
Success
Empty
Error
```

Examples:

-   no destinations found;
-   no active barriers;
-   no evidence;
-   no routes;
-   weather unavailable;
-   AI unavailable.

Do not leave blank screens.

------------------------------------------------------------------------

# 29. Testing Rules

No feature is "done" without appropriate testing.

### Unit

Test pure business logic.

### Integration

Test API + database + adapters.

### E2E

Test critical user journeys.

### Accessibility

Test keyboard, semantic structure, focus, contrast, and responsive
behavior.

At minimum, the main demo flow must be tested end-to-end.

------------------------------------------------------------------------

# 30. Critical E2E Flow

The following must remain working:

``` text
Create profile
→ Search destination
→ View accessibility
→ Plan route
→ View recommendation
→ Report barrier
→ Verify barrier
→ Recalculate route
→ Ask AI why
→ Use voice interface
```

Any change that breaks this flow must be treated as a regression.

------------------------------------------------------------------------

# 31. Dependency Rules

Before adding a dependency:

Ask:

1.  Do we actually need it?
2.  Can existing code solve this?
3.  Is it maintained?
4.  Does it create security/privacy concerns?
5.  Does it duplicate an existing library?
6.  Does it increase deployment complexity?

Do not install packages simply because an AI-generated solution uses
them.

------------------------------------------------------------------------

# 32. Versioning Rules

Pin or appropriately constrain important dependencies.

When upgrading:

-   inspect breaking changes;
-   run tests;
-   check build;
-   check critical flows;
-   document important upgrades.

Do not upgrade multiple major dependencies at once unless necessary.

------------------------------------------------------------------------

# 33. Git Rules

Use meaningful commits.

Examples:

``` text
feat: add accessibility profile
feat: add barrier reporting
fix: correct route scoring
refactor: extract weather adapter
docs: update architecture
test: add barrier lifecycle tests
```

Do not commit:

``` text
.env
credentials
private uploads
generated secrets
large unnecessary files
```

Avoid giant commits that mix unrelated features.

------------------------------------------------------------------------

# 34. Branch Rules

Recommended:

``` text
main
develop
feature/*
fix/*
```

For an individual developer, a simpler workflow is acceptable:

``` text
main
feature/*
```

Do not create branches merely for every tiny change.

Merge only tested work.

------------------------------------------------------------------------

# 35. Documentation Rules

When behavior changes, update documentation.

Important changes may require updates to:

``` text
PRD.md
ARCHITECTURE.md
API_CONTRACTS.md
DATA_MODEL.md
DESIGN.md
PHASES.md
MEMORY.md
README.md
```

Do not allow documentation to describe functionality that no longer
exists.

------------------------------------------------------------------------

# 36. Design Rules

The UI should be:

-   modern;
-   calm;
-   readable;
-   accessible;
-   responsive;
-   consistent.

Avoid:

-   excessive glassmorphism that hurts readability;
-   tiny text;
-   color-only indicators;
-   animation everywhere;
-   excessive gradients;
-   inaccessible maps;
-   hidden critical information.

Accessibility information must remain readable even when visual effects
are disabled.

------------------------------------------------------------------------

# 37. Map Rules

The map is important but must not be the only way to understand a
journey.

Every critical map result should have a corresponding text/card
representation.

Users should be able to understand:

``` text
Route
Distance
Duration
Accessibility
Warnings
Confidence
```

without relying exclusively on map colors.

------------------------------------------------------------------------

# 38. Demo Data Rules

Synthetic/demo data is allowed for prototyping.

But it MUST be labelled internally and/or visibly when appropriate.

Never present:

``` text
synthetic crowd data
synthetic verification
fake authority record
```

as real-world official information.

The SIH demo must clearly distinguish prototype/demo data from live
sources.

------------------------------------------------------------------------

# 39. Performance Rules

Do not optimize prematurely.

First make the correct architecture.

Then measure.

Important areas:

-   map loading;
-   database spatial queries;
-   route requests;
-   AI latency;
-   voice latency;
-   image upload/analysis.

Use caching only when its correctness implications are understood.

Current barrier information must not be served from an unsafe stale
cache.

------------------------------------------------------------------------

# 40. Security Rules for File Uploads

Validate:

-   MIME type;
-   extension;
-   file size;
-   authorization;
-   storage path;
-   filename handling.

Do not trust the filename supplied by a client.

Generate safe storage keys.

Do not execute uploaded files.

------------------------------------------------------------------------

# 41. Admin Rules

Admin functions must not be exposed to normal users.

Every privileged action should:

-   verify role server-side;
-   validate input;
-   write audit logs;
-   provide confirmation for destructive operations.

Prefer soft deletion/status changes for important records where
appropriate.

------------------------------------------------------------------------

# 42. S21/S22 Rules

Do not force S21/S22 features into the S20 MVP.

Instead:

``` text
S20 Core
    ↓
Stable extension interfaces
    ↓
S21/S22 modules later
```

Do not compromise the accessibility journey planner just to add more
features for the sake of feature count.

------------------------------------------------------------------------

# 43. "No Hallucination" Rule

If the system does not know:

``` text
Say it does not know.
```

Examples:

Bad:

> "The museum definitely has an accessible elevator."

if the database has no evidence.

Good:

> "I couldn't verify an elevator from the available data."

Bad:

> "This route is completely safe."

Good:

> "This route has no reported accessibility barrier in the available
> data."

------------------------------------------------------------------------

# 44. "No Fake Verification" Rule

Never create:

``` text
Verified by Authority
```

unless a legitimate verification action/data source exists.

Never fabricate:

-   auditor names;
-   authority names;
-   verification timestamps;
-   official sources.

------------------------------------------------------------------------

# 45. "No Fake Live Data" Rule

Never label data:

``` text
LIVE
REAL-TIME
CURRENT
VERIFIED
OFFICIAL
```

unless the system actually has the corresponding source/state.

For demo scenarios, explicitly label simulated conditions where
necessary.

------------------------------------------------------------------------

# 46. Definition of Done

A task is complete only when:

-   implementation exists;
-   relevant tests pass;
-   no known critical regression exists;
-   loading/error/empty states are handled;
-   security implications are checked;
-   documentation is updated when necessary;
-   code follows architecture;
-   the requested acceptance criteria are satisfied.

------------------------------------------------------------------------

# 47. AI Agent Completion Report

After completing a meaningful task, the coding agent should report:

``` text
Implemented:
- ...

Files changed:
- ...

Tests:
- ...

Build/lint:
- ...

Known limitations:
- ...

Documentation updated:
- ...

Next recommended task:
- ...
```

Do not claim success without actually checking the relevant commands.

------------------------------------------------------------------------

# 48. Stop Conditions

The AI agent must stop and ask for direction if:

-   PRD requirements conflict;
-   architecture requires a major redesign;
-   a security-sensitive decision is unclear;
-   an external API is unavailable and no approved alternative exists;
-   database migration could destroy existing data;
-   a feature requires changing the stack;
-   a requirement is ambiguous and guessing could create significant
    rework;
-   implementation would violate an existing rule.

------------------------------------------------------------------------

# 49. Final Engineering Principle

## Build for truth, not just for demo appearance.

AccessPath should not merely look like an accessibility platform.

The core demo must genuinely demonstrate:

``` text
Accessibility Data
        +
Traveller Preferences
        +
Current Conditions
        +
Barrier Intelligence
        +
Evidence
        +
Verification
        ↓
Personalized Recommendation
        ↓
Explainable AI
        ↓
Voice/Text Experience
```

The visual polish supports the product.

The **trusted accessibility intelligence** is the product.

------------------------------------------------------------------------

## Next Documents

After this document:

1.  `PHASES.md` --- development roadmap and milestones.
2.  `DESIGN.md` --- UI/UX system and screen specifications.
3.  `DATA_MODEL.md` --- exact database schema and relationships.
4.  `API_CONTRACTS.md` --- endpoint request/response contracts.

`MEMORY.md` will be created when implementation begins.
