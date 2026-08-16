from typing import Optional
from uuid import UUID

from app.models.accessibility import AccessibilityRecord
from app.models.enums import AccessibilityFeature, AccessibilityStatus, BarrierSeverity
from app.repositories.accessibility import AccessibilityRepository
from app.services.barrier_service import BarrierService
from app.services.trust_service import TrustService


class AccessibilityService:
    """
    Evaluates accessibility compatibility between a traveller profile and a place or route.
    Uses three-valued logic (AVAILABLE, UNAVAILABLE, UNKNOWN) rather than collapsing to binary.
    """

    def __init__(
        self,
        accessibility_repo: AccessibilityRepository,
        barrier_service: BarrierService,
        trust_service: TrustService,
    ):
        self.accessibility_repo = accessibility_repo
        self.barrier_service = barrier_service
        self.trust_service = trust_service

    async def evaluate_place(self, place, profile) -> dict:
        """
        Evaluate place accessibility against a traveller profile.
        Returns:
            {
                "score": int (0 to 100),
                "level": "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN",
                "reasons": list[str],
                "warnings": list[str],
                "unknowns": list[str],
                "trust_info": dict
            }
        """
        reasons = []
        warnings = []
        unknowns = []

        # 1. Fetch accessibility records for the place
        records = await self.accessibility_repo.get_records_for_place(place.id, exclude_expired=True)
        record_map = {r.feature: r for r in records}

        # 2. Extract traveller needs
        # We define a set of accessibility features the user cares about based on their profile
        required_features = []
        
        if getattr(profile, "avoid_stairs", False) or getattr(profile, "prefer_step_free", False):
            required_features.append(AccessibilityFeature.STEP_FREE_ENTRANCE.value)
            required_features.append(AccessibilityFeature.ACCESSIBLE_ROUTE.value)

        # Check mobility preferences
        mobility = getattr(profile, "mobility_preferences", {}) or {}
        if mobility.get("wheelchair") or mobility.get("requires_wheelchair"):
            required_features.append(AccessibilityFeature.STEP_FREE_ENTRANCE.value)
            required_features.append(AccessibilityFeature.ACCESSIBLE_TOILET.value)
            required_features.append(AccessibilityFeature.ACCESSIBLE_ROUTE.value)
            required_features.append(AccessibilityFeature.WHEELCHAIR_AVAILABLE.value)
        if mobility.get("parking") or mobility.get("requires_parking"):
            required_features.append(AccessibilityFeature.ACCESSIBLE_PARKING.value)

        # Check vision preferences
        vision = getattr(profile, "vision_preferences", {}) or {}
        if vision.get("tactile_guidance") or vision.get("requires_tactile_guidance"):
            required_features.append(AccessibilityFeature.TACTILE_GUIDANCE.value)
        if vision.get("braille") or vision.get("requires_braille"):
            required_features.append(AccessibilityFeature.VISUAL_ASSISTANCE.value)

        # Check rest preferences
        if getattr(profile, "prefer_rest_stops", False):
            required_features.append(AccessibilityFeature.REST_AREA.value)

        # Deduplicate required features
        required_features = list(set(required_features))

        # 3. Calculate feature score
        score = 100
        # If the user has no specific requirements, we evaluate all general features to give a general score
        features_to_check = required_features if required_features else [
            AccessibilityFeature.STEP_FREE_ENTRANCE.value,
            AccessibilityFeature.ACCESSIBLE_TOILET.value,
            AccessibilityFeature.ACCESSIBLE_ROUTE.value,
        ]

        # Evaluate features
        for feature in features_to_check:
            record = record_map.get(feature)
            if not record:
                unknowns.append(f"No data for feature: {feature}")
                score -= 10  # Mild penalty for uncertainty
            else:
                status = record.status
                if status == AccessibilityStatus.AVAILABLE.value:
                    reasons.append(f"Feature '{feature}' is available")
                elif status in (AccessibilityStatus.UNAVAILABLE.value, AccessibilityStatus.TEMPORARILY_UNAVAILABLE.value):
                    warnings.append(f"Feature '{feature}' is unavailable ({status})")
                    score -= 30  # High penalty for unmet requirement
                elif status == AccessibilityStatus.UNKNOWN.value:
                    unknowns.append(f"Feature '{feature}' is status UNKNOWN")
                    score -= 10

        # 4. Check for active barriers at the place
        # Query barriers in a small radius around the place location
        from app.schemas.place import parse_postgis_location
        parsed_loc = parse_postgis_location(place.location)
        if parsed_loc:
            # Check within 50 meters
            nearby_barriers = await self.barrier_service.get_nearby_barriers(
                lat=parsed_loc.lat,
                lng=parsed_loc.lng,
                radius_meters=50,
                exclude_expired=True
            )
            for barrier, dist in nearby_barriers:
                # Barrier directly affects the place
                severity = barrier.severity
                warnings.append(f"Active barrier near place: {barrier.title} ({severity} severity)")
                if severity == BarrierSeverity.HIGH.value:
                    score -= 40
                elif severity == BarrierSeverity.MEDIUM.value:
                    score -= 20
                else:
                    score -= 10

        # Bound score between 0 and 100
        score = max(0, min(100, score))

        # Determine level
        if score >= 80:
            level = "HIGH"
        elif score >= 50:
            level = "MEDIUM"
        elif score >= 20:
            level = "LOW"
        else:
            level = "UNKNOWN"

        # 5. Evaluate Trust for the place record
        # Use first record or a general place trust evaluation
        best_trust_score = 0.5
        best_trust_level = "UNKNOWN"
        best_trust_reasons = ["No specific verification records"]

        if records:
            # Evaluate trust of the records
            for r in records:
                t = await self.trust_service.evaluate_trust(r)
                if t["score"] > best_trust_score:
                    best_trust_score = t["score"]
                    best_trust_level = t["level"]
                    best_trust_reasons = t["reasons"]

        trust_info = {
            "level": best_trust_level,
            "score": best_trust_score,
            "reasons": best_trust_reasons
        }

        return {
            "score": score,
            "level": level,
            "reasons": reasons,
            "warnings": warnings,
            "unknowns": unknowns,
            "trust_info": trust_info
        }
