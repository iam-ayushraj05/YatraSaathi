"""
yatrasaathi — Central model registry.

Import order matters for SQLAlchemy relationship resolution.
All models must be imported here so that Alembic can detect them.
"""

# Base and mixins
from app.models.base import Base, UUIDMixin, TimestampMixin, utcnow  # noqa: F401


# Enums
from app.models.enums import (  # noqa: F401
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
    TrustLevel,
    AccessibilityLevel,
    ItineraryStatus,
    ItinerarySource,
    CrowdLevel,
)

# Core user models (no FK deps on other domain models except self-refs)
from app.models.user import User, AccessibilityProfile  # noqa: F401

# Place and spatial models
from app.models.place import Place, Facility, AssistancePoint  # noqa: F401

# Accessibility
from app.models.accessibility import AccessibilityRecord  # noqa: F401

# Reports (must be before Barrier because Barrier has FK → reports)
from app.models.report import Report  # noqa: F401

# Barriers, Evidence, Verification
from app.models.barrier import (  # noqa: F401
    Barrier,
    Evidence,
    EvidenceObservation,
    Verification,
)

# Routes
from app.models.route import (  # noqa: F401
    RouteRequest,
    Route,
    RouteSegment,
    RouteConstraint,
)

# Itineraries
from app.models.itinerary import Itinerary, ItineraryStop  # noqa: F401

# Context
from app.models.weather import WeatherSnapshot  # noqa: F401
from app.models.crowd import CrowdObservation  # noqa: F401

# Audit
from app.models.audit import AuditLog  # noqa: F401

__all__ = [
    # Base
    "Base",
    "UUIDMixin",
    "TimestampMixin",
    "utcnow",
    # Enums
    "UserRole",
    "RouteStyle",
    "PlaceCategory",
    "AccessibilityFeature",
    "AccessibilityStatus",
    "FacilityType",
    "BarrierType",
    "BarrierSeverity",
    "BarrierStatus",
    "ReportType",
    "ReportStatus",
    "VerificationAction",
    "AssistanceType",
    "AvailabilityStatus",
    "SourceType",
    "ConfidenceLevel",
    "RecordStatus",
    "TrustLevel",
    "AccessibilityLevel",
    "ItineraryStatus",
    "ItinerarySource",
    "CrowdLevel",
    # Models
    "User",
    "AccessibilityProfile",
    "Place",
    "Facility",
    "AssistancePoint",
    "AccessibilityRecord",
    "Report",
    "Barrier",
    "Evidence",
    "EvidenceObservation",
    "Verification",
    "RouteRequest",
    "Route",
    "RouteSegment",
    "RouteConstraint",
    "Itinerary",
    "ItineraryStop",
    "WeatherSnapshot",
    "CrowdObservation",
    "AuditLog",
]
