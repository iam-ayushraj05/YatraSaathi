"""
YatraSaathi — API schemas.
"""
from app.schemas.base import (  # noqa: F401
    MetaInfo,
    ResponseWrapper,
    ListResponseWrapper,
    ErrorDetail,
    ErrorResponse,
)
from app.schemas.common import Coordinate  # noqa: F401
from app.schemas.user import (  # noqa: F401
    UserCreate,
    UserLogin,
    UserResponse,
    AccessibilityProfileCreate,
    AccessibilityProfileUpdate,
    AccessibilityProfileResponse,
)
from app.schemas.place import (  # noqa: F401
    AccessibilityRecordCreate,
    AccessibilityRecordResponse,
    FacilityCreate,
    FacilityResponse,
    AssistancePointCreate,
    AssistancePointResponse,
    PlaceCreate,
    PlaceResponse,
    PlaceAccessibilitySummary,
    PlaceDetailsResponse,
)
from app.schemas.barrier import (  # noqa: F401
    ReportCreate,
    ReportResponse,
    BarrierCreate,
    BarrierResponse,
    EvidenceResponse,
    EvidenceObservationResponse,
    VerifyReportRequest,
    RejectReportRequest,
    ResolveBarrierRequest,
    VerificationResponse,
)
from app.schemas.route import (  # noqa: F401
    RouteConstraintCreate,
    RouteConstraintResponse,
    RouteRequestCreate,
    RouteRequestResponse,
    RouteSegmentCreate,
    RouteSegmentResponse,
    RouteCreate,
    RouteResponse,
    RoutePlanRequest,
    RoutePlanResponse,
)
from app.schemas.itinerary import (  # noqa: F401
    ItineraryStopCreate,
    ItineraryStopUpdate,
    ItineraryStopResponse,
    ItineraryCreate,
    ItineraryUpdate,
    ItineraryResponse,
)
from app.schemas.context import (  # noqa: F401
    WeatherSnapshotCreate,
    WeatherSnapshotResponse,
    CrowdObservationCreate,
    CrowdObservationResponse,
)
