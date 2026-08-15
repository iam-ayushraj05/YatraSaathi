# AccessPath --- UI/UX Design Specification

**Project:** S20 --- Accessible Journey Planner with Real-Time Barrier
and Assistance Mapping\
**Document:** UI/UX Design System\
**Version:** 1.0

------------------------------------------------------------------------

# 1. Design Goal

AccessPath should feel like a **modern travel product built around
accessibility intelligence**, not a generic government portal and not a
generic AI chatbot.

The UI must communicate:

``` text
Trust
+
Clarity
+
Accessibility
+
Calmness
+
Intelligence
```

The most important information should always be understandable without
relying only on color, animation, or the map.

------------------------------------------------------------------------

# 2. Product Visual Direction

## Design Language

Use:

-   clean modern cards;
-   generous spacing;
-   strong typography;
-   subtle depth;
-   restrained gradients;
-   map-first travel context;
-   clear accessibility indicators;
-   evidence/trust metadata;
-   purposeful micro-interactions.

Avoid:

-   excessive glassmorphism;
-   neon cyberpunk styling;
-   huge decorative animations;
-   tiny text;
-   excessive rounded cards;
-   cluttered dashboards;
-   information hidden behind multiple clicks.

The product should look credible enough for a real travel platform.

------------------------------------------------------------------------

# 3. Core Color System

Use semantic colors rather than hardcoding colors throughout components.

Suggested tokens:

``` text
--background
--surface
--surface-elevated
--text-primary
--text-secondary
--text-muted

--primary
--primary-foreground

--success
--success-foreground

--warning
--warning-foreground

--danger
--danger-foreground

--info
--info-foreground

--border
--focus
```

Accessibility states:

``` text
Accessible / positive
Warning / needs attention
Unavailable / negative
Unknown / neutral
Verified / trusted
```

Never communicate state through color alone.

Example:

``` text
✓ Verified
⚠ Needs review
? Unknown
× Not available
```

------------------------------------------------------------------------

# 4. Typography

Use a modern highly readable sans-serif.

Suggested hierarchy:

``` text
Display
48–64px

H1
36–48px

H2
28–36px

H3
22–28px

Body
16px

Secondary
14px

Caption
12–13px
```

On mobile, scale down progressively.

Avoid extremely thin font weights.

Body text should have comfortable line height.

------------------------------------------------------------------------

# 5. Spacing

Use a consistent spacing scale.

Example:

``` text
4
8
12
16
20
24
32
40
48
64
80
```

Do not invent random margins for every component.

------------------------------------------------------------------------

# 6. Radius

Use a restrained radius system:

``` text
Small controls: 8px
Cards: 14–18px
Large surfaces: 20–24px
Pills: 999px
```

Avoid rounding every element heavily.

------------------------------------------------------------------------

# 7. Shadows

Use subtle elevation.

Example semantic levels:

``` text
shadow-sm
shadow-card
shadow-elevated
shadow-modal
```

Do not use heavy shadows around every component.

------------------------------------------------------------------------

# 8. Motion

Animations should explain state changes.

Use:

``` text
150–250ms
```

for most micro-interactions.

Useful animations:

-   card hover;
-   route selection;
-   map marker selection;
-   drawer opening;
-   loading state;
-   voice status;
-   barrier update.

Avoid:

-   constant floating animations;
-   unnecessary parallax;
-   distracting page transitions.

Respect:

``` text
prefers-reduced-motion
```

------------------------------------------------------------------------

# 9. Global Navigation

Desktop:

``` text
┌─────────────────────────────────────────────────────────────┐
│ AccessPath    Explore  Routes  Trips  Reports     Profile   │
└─────────────────────────────────────────────────────────────┘
```

Mobile:

``` text
┌──────────────────────────┐
│ AccessPath         ☰     │
└──────────────────────────┘
```

Primary navigation:

``` text
Explore
My Journey
Copilot
Reports
Profile
```

Auditor users get:

``` text
Overview
Reports
Map
Verification
Analytics
```

------------------------------------------------------------------------

# 10. Landing Page

## Goal

Explain the problem immediately.

Hero:

``` text
Travel without guessing accessibility.

Plan journeys around your needs,
current barriers, and verified information.
```

Primary CTA:

``` text
Plan an accessible journey
```

Secondary:

``` text
Explore how it works
```

Hero visual:

``` text
          MAP
   ┌───────────────────────┐
   │       ● Destination   │
   │   ╱───────────────╲   │
   │  ╱  ✓ Accessible  ╲  │
   │ ●                  ● │
   └───────────────────────┘

     Verified accessibility
     Real-time barriers
     AI + Voice Copilot
```

------------------------------------------------------------------------

# 11. Landing Page Sections

Order:

``` text
Hero
 ↓
Problem
 ↓
How AccessPath works
 ↓
Live barrier example
 ↓
AI Copilot
 ↓
Voice experience
 ↓
Trust & verification
 ↓
Future S21/S22
 ↓
CTA
```

The page should tell a story rather than list random features.

------------------------------------------------------------------------

# 12. Dashboard

Dashboard should answer:

> "What can I do now?"

Layout:

``` text
┌──────────────────────────────────────────────────────┐
│ Good morning                                         │
│ Where would you like to go?                         │
│ [ Search destination...                         ]    │
│                                                      │
│ [ Use Copilot ] [ 🎙 Voice ]                         │
├──────────────────────────────────────────────────────┤
│ Suggested for you                                    │
│                                                      │
│ [ Destination ] [ Destination ] [ Destination ]      │
├──────────────────────────────────────────────────────┤
│ Current accessibility alerts                         │
│ ⚠ Elevator unavailable near ...                     │
├──────────────────────────────────────────────────────┤
│ Recent journeys                                      │
└──────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 13. Explore Page

Primary structure:

``` text
┌──────────────────────────────────────────────────────┐
│ Search places                                        │
│ [ Museum, park, attraction... ]                     │
├──────────────────────┬───────────────────────────────┤
│ Filters              │ Map                           │
│                      │                               │
│ □ Step-free          │         ●                     │
│ □ Accessible toilet  │    ●          ●               │
│ □ Parking            │              ●                │
│ □ Low walking        │                               │
│                      │                               │
├──────────────────────┴───────────────────────────────┤
│ Results                                               │
│                                                      │
│ Destination Card                                     │
└──────────────────────────────────────────────────────┘
```

Desktop: map + results.

Mobile:

``` text
Search
Filters
Results
Map
```

with a toggle:

``` text
List | Map
```

------------------------------------------------------------------------

# 14. Destination Card

Each card should show:

``` text
[Image]

Destination Name
Location

✓ Step-free
✓ Accessible toilet
⚠ Elevator status unknown

Accessibility:
High

Verified:
Recently

[View details]
```

Avoid overwhelming users with every database field.

------------------------------------------------------------------------

# 15. Destination Detail Page

Structure:

``` text
┌──────────────────────────────────────────────────────┐
│ ← Back                                               │
│                                                      │
│ Destination Name                                     │
│ Location                                             │
│                                                      │
│ [ Hero image / map ]                                 │
├──────────────────────────────────────────────────────┤
│ Accessibility summary                                │
│                                                      │
│ ✓ Step-free entrance                                 │
│ ✓ Accessible toilet                                  │
│ ? Elevator information unavailable                   │
├──────────────────────────────────────────────────────┤
│ Verification                                         │
│                                                      │
│ Verified by: ... / source type                      │
│ Last verified: ...                                  │
│ Evidence available                                   │
├──────────────────────────────────────────────────────┤
│ [ Plan route ]  [ Ask Copilot ]                      │
└──────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 16. Accessibility Summary Component

This is a core reusable component.

``` text
Accessibility
────────────────────────

Mobility
✓ Step-free entrance
✓ Accessible route
? Elevator

Facilities
✓ Accessible toilet
✓ Rest seating

Confidence
HIGH

Last verified
Recently
```

Use expandable sections for detailed information.

------------------------------------------------------------------------

# 17. Traveller Profile

Onboarding should feel like preference setup, not a medical form.

Heading:

``` text
Tell us how you prefer to travel.
```

Subheading:

``` text
You can change these preferences anytime.
```

Sections:

``` text
Mobility
Vision
Hearing
Cognitive preferences
Walking distance
Route preferences
```

Use selectable chips/cards:

``` text
[ Step-free ]
[ Wheelchair-friendly ]
[ Less walking ]
[ Avoid stairs ]
[ Frequent rest stops ]
```

Avoid requiring a diagnosis or unnecessary medical information.

------------------------------------------------------------------------

# 18. Route Planner

This is the core product screen.

Desktop:

``` text
┌─────────────────────────────────────────────────────────────┐
│ From [ Current location ]                                  │
│ To   [ Destination ]                                       │
├───────────────────────────────┬─────────────────────────────┤
│ Route options                 │                             │
│                               │            MAP              │
│ ★ Recommended                 │                             │
│ 28 min • 1.1 km               │       ╭──────────╮          │
│ ✓ Step-free                   │      ╱            ╲         │
│ ✓ No active barriers          │     ●              ●        │
│ Confidence: High              │                             │
│                               │                             │
│ Fastest                       │                             │
│ 22 min • stairs               │                             │
│                               │                             │
│ Less walking                  │                             │
│ 34 min • 700 m                │                             │
└───────────────────────────────┴─────────────────────────────┘
```

------------------------------------------------------------------------

# 19. Route Card

Recommended card:

``` text
★ Recommended

28 min
1.1 km

✓ Step-free
✓ No active verified barriers
✓ Accessible entrance

Confidence: High

Why recommended?
Best match for your mobility preferences.

[View route]
```

The phrase:

``` text
Why recommended?
```

is important for explainability.

------------------------------------------------------------------------

# 20. Barrier Alert

When a barrier affects a route:

``` text
┌──────────────────────────────────────────┐
│ ⚠ Route update                           │
│                                          │
│ Elevator temporarily unavailable         │
│                                          │
│ Your previous route depends on this      │
│ elevator.                                │
│                                          │
│ A step-free alternative is available.    │
│                                          │
│ [ View new route ]                       │
└──────────────────────────────────────────┘
```

Use strong hierarchy.

Do not use alarming animations.

------------------------------------------------------------------------

# 21. Barrier Detail

``` text
Temporary barrier

Broken elevator

Status
✓ Verified

Reported
Today, 10:20

Verified
Today, 11:05

Evidence
[ View evidence ]

Impact
Affects routes requiring this elevator.

[ Find alternatives ]
```

------------------------------------------------------------------------

# 22. Report Barrier Screen

Keep the form short.

``` text
Report an accessibility barrier

What happened?

[ Elevator unavailable ▼ ]

Where?

[ Map location ]

Description

[________________________]

Severity

○ Low
○ Medium
○ High

Add evidence
[ Upload image ]

[ Submit report ]
```

After submission:

``` text
Report submitted.

Status:
Pending verification

Thank you for helping keep journey information current.
```

------------------------------------------------------------------------

# 23. Trust / Evidence Drawer

When user taps:

``` text
Why should I trust this?
```

Open a side drawer/modal:

``` text
Accessibility claim

✓ Verified

Source
Auditor verification

Evidence
2 supporting reports

Last verified
Today, 11:05

Confidence
High

This information may change if the
facility status changes.
```

This is an important SIH differentiator.

------------------------------------------------------------------------

# 24. AI Copilot

The Copilot should feel integrated into the product rather than like a
separate ChatGPT clone.

Desktop:

``` text
┌──────────────────────────────────────────────┐
│ AccessPath Copilot                      ×   │
├──────────────────────────────────────────────┤
│                                              │
│ You                                        │
│ Plan an accessible afternoon trip.          │
│                                              │
│ Copilot                                    │
│ Sure. Based on your preferences, I found    │
│ three suitable destinations.                │
│                                              │
│ [Museum] [Park] [Cultural Centre]            │
│                                              │
│ ──────────────────────────────────────────── │
│ Ask anything...                       🎙  ↑  │
└──────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 25. Copilot Response Design

Do not return giant paragraphs.

Use structured cards:

``` text
Recommendation
Why
Accessibility
Current barriers
Confidence
Next action
```

Example:

``` text
I recommend the City Museum.

Why:
✓ Step-free entrance
✓ Accessible toilet
✓ 850m walking distance
✓ No active verified barriers

Confidence: High

[Plan route]
```

------------------------------------------------------------------------

# 26. Voice Interface

Voice should have a minimal visual state.

``` text
┌─────────────────────────────────┐
│                                 │
│          ●  Listening           │
│                                 │
│     "Find a route with          │
│      no stairs."                │
│                                 │
│        ◉ ◉ ◉ ◉                 │
│                                 │
│      [ End voice ]              │
└─────────────────────────────────┘
```

States:

``` text
Idle
Listening
Thinking
Speaking
Error
```

Use a subtle animated waveform only when useful.

------------------------------------------------------------------------

# 27. Voice Result

After the voice response, show the same information visually:

``` text
You asked:
"Find a step-free route."

Copilot found:

★ Route B
31 min • 1.2 km

✓ Step-free
✓ No active barriers

[Show on map]
```

This is important because voice should not hide visual context.

------------------------------------------------------------------------

# 28. My Journey

Journey timeline:

``` text
Morning
   │
   ▼
City Museum
   │
   │ 12 min
   ▼
Accessible Café
   │
   │ 8 min
   ▼
Park
```

Each stop:

``` text
Accessibility
Travel time
Barrier status
Confidence
```

------------------------------------------------------------------------

# 29. Itinerary Builder

AI-generated itinerary should be editable.

``` text
Your accessible afternoon

10:00
City Museum
✓ Step-free

12:00
Accessible Café
✓ Low walking

13:30
Park
⚠ Outdoor route

[ Add stop ]
[ Recalculate ]
[ Ask Copilot ]
```

Never make the AI-generated itinerary immutable.

------------------------------------------------------------------------

# 30. Auditor Dashboard

Desktop dashboard:

``` text
┌──────────────────────────────────────────────────────────┐
│ Overview                                                 │
├─────────────┬─────────────┬──────────────┬──────────────┤
│ Pending     │ Verified    │ Disputed     │ Expiring     │
│ 24          │ 182         │ 7            │ 13           │
├──────────────────────────────────────────────────────────┤
│ Reports Map                                              │
│                                                          │
│              ●       ●                                   │
│        ●                      ●                          │
│                  ●                                       │
├──────────────────────────────────────────────────────────┤
│ Recent reports                                           │
└──────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 31. Verification Screen

``` text
Report #1042

Broken elevator

Location
...

Description
...

Evidence
[ Image ]

AI-assisted observation
"Image may show elevator closure."

Status
Pending verification

[ Verify ]
[ Reject ]
[ Mark disputed ]
```

The AI observation must be visually distinct from human verification.

------------------------------------------------------------------------

# 32. Mobile Navigation

Bottom navigation:

``` text
┌─────────────────────────────────────┐
│                                     │
│              Content                │
│                                     │
├─────────────────────────────────────┤
│ Explore │ Journey │ Copilot │ You  │
└─────────────────────────────────────┘
```

Voice can be a prominent floating action button where appropriate.

Do not cover important content.

------------------------------------------------------------------------

# 33. Responsive Map Behavior

Desktop:

``` text
Map 60%
Results 40%
```

Tablet:

``` text
Map 50%
Results 50%
```

Mobile:

``` text
Map/List toggle
```

Avoid forcing users to scroll through an enormous map before seeing
route information.

------------------------------------------------------------------------

# 34. Accessibility UI Rules

The product itself must be accessible.

Requirements:

-   semantic HTML;
-   keyboard navigation;
-   visible focus;
-   logical tab order;
-   accessible labels;
-   screen-reader-friendly controls;
-   sufficient contrast;
-   no color-only meaning;
-   reduced motion;
-   responsive text;
-   touch targets large enough for comfortable interaction.

Map alternatives must exist.

------------------------------------------------------------------------

# 35. Status Components

Use consistent status badges.

``` text
✓ Verified
? Unknown
⚠ Needs review
× Unavailable
◷ Expiring
```

Example:

``` text
Accessibility   HIGH
Verification    ✓ Verified
Barrier         ⚠ Active
Confidence      HIGH
```

------------------------------------------------------------------------

# 36. Empty States

Examples:

### No results

``` text
No accessible destinations found.

Try:
- increasing your travel distance;
- changing route preferences;
- asking Copilot.
```

### No barrier reports

``` text
No active accessibility barriers reported here.
```

### Unknown accessibility

``` text
Accessibility information is incomplete.

We could not verify:
- elevator status
- accessible toilet

[Report information]
```

------------------------------------------------------------------------

# 37. Error States

Examples:

### Route unavailable

``` text
We couldn't calculate a route right now.

Your accessibility preferences are saved.

[Try again]
```

### AI unavailable

``` text
Copilot is temporarily unavailable.

You can still search destinations and plan routes.
```

### Voice unavailable

``` text
Voice is temporarily unavailable.

[Continue with text]
```

------------------------------------------------------------------------

# 38. Loading States

Prefer skeletons for page content.

For route calculation:

``` text
Finding routes...
Checking accessibility...
Checking active barriers...
Ranking options...
```

This makes the intelligence visible without pretending the model is
doing something it isn't.

------------------------------------------------------------------------

# 39. Accessibility Score Visualization

Avoid a giant score as the only signal.

Prefer:

``` text
Accessibility match

████████░░  High

✓ Step-free
✓ Low walking
✓ Accessible toilet
? Elevator
```

The score should always have reasons.

------------------------------------------------------------------------

# 40. Trust Visualization

Use a small confidence panel:

``` text
Trust

✓ Verified
Last checked: Today
Source: Auditor
Evidence: 2 reports
```

For uncertain information:

``` text
Trust

? Partially verified
Last checked: 12 days ago
Some information may be outdated.
```

------------------------------------------------------------------------

# 41. AI Explanation Pattern

Every major AI recommendation can follow:

``` text
Recommendation
↓
Evidence
↓
Reason
↓
Uncertainty
↓
Action
```

Example:

``` text
Recommended: Route B

Evidence:
✓ Step-free entrance
✓ No active verified barriers

Reason:
It best matches your "avoid stairs"
preference.

Uncertainty:
Elevator status is not currently verified.

[Use Route B]
```

------------------------------------------------------------------------

# 42. S21 UI Extension

When S21 is enabled, add:

``` text
Accessibility
Sustainability
Community
Crowding
```

Example:

``` text
Destination score

Accessibility    High
Community       High
Crowding        Low
Environmental   Good
```

Do not let sustainability metrics obscure accessibility requirements.

------------------------------------------------------------------------

# 43. S22 UI Extension

For generative travel:

``` text
Trip Copilot

Your preferences:
✓ Step-free
✓ Less walking
✓ Avoid crowds
✓ Local businesses

Trip duration:
[ 2 days ]

[ Generate accessible trip ]
```

Generated itinerary should show:

``` text
Why selected
Accessibility
Crowd level
Source
Confidence
```

------------------------------------------------------------------------

# 44. SIH Demo Mode

Create a controlled demo mode.

Possible entry:

``` text
[ Launch Demo ]
```

Demo mode can use a deterministic dataset so the presentation does not
depend entirely on external APIs.

Clearly indicate:

``` text
Demo environment
```

Do not fake live data without disclosure.

------------------------------------------------------------------------

# 45. SIH Demo Screen

Optional presentation mode:

``` text
ACCESSPATH

Accessible travel,
with evidence you can trust.

[ Start Demo ]

Scenario:
A temporary elevator outage
changes the recommended route.
```

Then guide the judge through:

``` text
Profile
→ Route
→ Barrier
→ Verification
→ Re-route
→ AI explanation
→ Voice
```

------------------------------------------------------------------------

# 46. Component Architecture

Suggested component tree:

``` text
components/
├── layout/
│   ├── Navbar
│   ├── Sidebar
│   └── MobileNav
│
├── accessibility/
│   ├── AccessibilitySummary
│   ├── AccessibilityBadge
│   ├── PreferenceSelector
│   └── ConfidenceIndicator
│
├── map/
│   ├── MapView
│   ├── PlaceMarker
│   ├── RouteLayer
│   └── BarrierMarker
│
├── route/
│   ├── RouteCard
│   ├── RouteList
│   ├── RouteReasoning
│   └── RouteAlert
│
├── copilot/
│   ├── CopilotPanel
│   ├── CopilotMessage
│   ├── RecommendationCard
│   └── SourceDrawer
│
├── voice/
│   ├── VoiceButton
│   ├── VoicePanel
│   └── VoiceStatus
│
├── reports/
│   ├── BarrierForm
│   ├── EvidenceUploader
│   └── ReportCard
│
└── auditor/
    ├── ReportTable
    ├── VerificationPanel
    └── AnalyticsCards
```

------------------------------------------------------------------------

# 47. UX Principle --- Progressive Disclosure

Do not show every piece of information immediately.

Default:

``` text
What?
Why?
Can I trust it?
What should I do?
```

Advanced details can be expanded:

``` text
Evidence
Source
Timestamp
Verification history
Technical details
```

------------------------------------------------------------------------

# 48. UX Principle --- Explain Before Asking

When the system needs information:

Bad:

``` text
Select accessibility profile.
```

Better:

``` text
Tell us what makes travel easier for you.
You can change these preferences anytime.
```

The interface should feel supportive, not bureaucratic.

------------------------------------------------------------------------

# 49. UX Principle --- Never Trap the User

Every important screen should have a clear way to:

``` text
Back
Cancel
Edit
Retry
Continue with another method
```

Voice users should be able to switch to text.

Map users should be able to use list/card views.

------------------------------------------------------------------------

# 50. UX Principle --- Trust Is Visible

Trust should not be hidden in a footer.

Important claims should visibly show:

``` text
Verification
Source
Last updated
Confidence
```

This is a product feature, not merely metadata.

------------------------------------------------------------------------

# 51. Final Visual Identity

AccessPath should communicate:

``` text
Travel
+
Accessibility
+
Trust
+
Intelligence
```

The product should feel like:

> **A trustworthy AI travel copilot that understands how a person needs
> to travel---not just where they want to go.**

------------------------------------------------------------------------

# 52. Design Definition of Done

The UI system is ready when:

-   [ ] All core screens are defined.
-   [ ] Desktop and mobile behavior is defined.
-   [ ] Accessibility states are standardized.
-   [ ] Trust states are standardized.
-   [ ] AI Copilot UI is defined.
-   [ ] Voice UI is defined.
-   [ ] Barrier workflow UI is defined.
-   [ ] Auditor UI is defined.
-   [ ] S21/S22 extension patterns are defined.
-   [ ] Loading/empty/error states are defined.
-   [ ] Reusable component structure is defined.
-   [ ] SIH demo mode is defined.
