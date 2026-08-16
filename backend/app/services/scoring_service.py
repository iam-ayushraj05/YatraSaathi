from typing import Optional
from pydantic import BaseModel, Field

from app.models.enums import BarrierSeverity, RouteStyle
from app.services.exceptions import ValidationError


class ScoringConfig(BaseModel):
    """Configurable weights for the YatraSaathi scoring engine."""
    barrier_critical_penalty: float = 80.0
    barrier_high_penalty: float = 40.0
    barrier_medium_penalty: float = 20.0
    barrier_low_penalty: float = 10.0
    
    stairs_critical_penalty: float = 50.0
    stairs_step_penalty: float = 5.0
    
    walking_limit_exceeded_penalty: float = 40.0
    surface_unsuitable_penalty: float = 25.0
    
    low_trust_penalty: float = 15.0
    adverse_weather_penalty: float = 15.0
    heavy_crowd_penalty: float = 10.0


class ScoringService:
    """
    Deterministic scoring engine that evaluates accessibility suitability.
    Computes scores, sets levels, and provides explanations for recommendations.
    """

    def __init__(self, config: Optional[ScoringConfig] = None):
        self.config = config or ScoringConfig()

    def evaluate_route(
        self,
        route,
        profile,
        barriers_on_route: list,
        weather=None,
        crowd=None,
        trust_level: str = "HIGH"
    ) -> dict:
        """
        Evaluate route compatibility against a traveller profile.
        Returns:
            {
                "score": int (0 to 100),
                "level": "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN",
                "reasons": list[str],
                "warnings": list[str]
            }
        """
        reasons = []
        warnings = []
        score = 100.0

        # 1. Check Stairs
        avoid_stairs = getattr(profile, "avoid_stairs", False)
        prefer_step_free = getattr(profile, "prefer_step_free", False)
        stairs_count = getattr(route, "stairs_count", 0) or 0

        if stairs_count > 0:
            if avoid_stairs:
                score -= self.config.stairs_critical_penalty
                warnings.append(f"Route contains {stairs_count} stairs but traveller profile requires: 'avoid stairs'")
            elif prefer_step_free:
                score -= min(stairs_count * self.config.stairs_step_penalty, 30.0)
                warnings.append(f"Route contains {stairs_count} stairs but traveller prefers step-free paths")
            else:
                reasons.append(f"Route contains {stairs_count} stairs (acceptable for this profile)")
        else:
            reasons.append("Route is step-free")

        # 2. Check Active Barriers on the Route
        for barrier in barriers_on_route:
            severity = getattr(barrier, "severity", "MEDIUM")
            warnings.append(f"Active barrier on route: {barrier.title} ({severity} severity)")
            
            if severity == BarrierSeverity.CRITICAL.value:
                score -= self.config.barrier_critical_penalty
            elif severity == BarrierSeverity.HIGH.value:
                score -= self.config.barrier_high_penalty
            elif severity == BarrierSeverity.MEDIUM.value:
                score -= self.config.barrier_medium_penalty
            else:
                score -= self.config.barrier_low_penalty

        # 3. Check Walking Limit
        walking_limit = getattr(profile, "walking_limit_meters", None)
        distance = getattr(route, "distance_meters", 0.0) or 0.0
        if walking_limit is not None and distance > walking_limit:
            score -= self.config.walking_limit_exceeded_penalty
            warnings.append(f"Route distance ({distance:.0f}m) exceeds traveller walking limit ({walking_limit}m)")
        else:
            reasons.append(f"Route distance ({distance:.0f}m) is within traveller capabilities")

        # 4. Check Surface Type Compatibility
        mobility = getattr(profile, "mobility_preferences", {}) or {}
        requires_wheelchair = mobility.get("wheelchair") or mobility.get("requires_wheelchair")
        if requires_wheelchair:
            # Check route segments surface type
            segments = getattr(route, "segments", [])
            has_bad_surface = False
            for seg in segments:
                surface = getattr(seg, "surface_type", None)
                if surface in ("GRAVEL", "COBBLESTONE", "UNPAVED", "SAND"):
                    has_bad_surface = True
                    warnings.append(f"Segment contains unsuitable surface for wheelchairs: {surface}")
            if has_bad_surface:
                score -= self.config.surface_unsuitable_penalty
            else:
                reasons.append("All segments have suitable paved surfaces")

        # 5. Check Trust / Freshness
        if trust_level == "LOW":
            score -= self.config.low_trust_penalty
            warnings.append("Route uses accessibility data with low trust/freshness")
        elif trust_level == "HIGH":
            reasons.append("Highly trusted accessibility data used")

        # 6. Check Weather
        if weather:
            rain_prob = getattr(weather, "rain_probability", 0.0) or 0.0
            condition = getattr(weather, "condition", "") or ""
            # Bad weather is extra challenging for wheelchair or vision-impaired users
            if rain_prob > 0.6 or "STORM" in condition.upper() or "RAIN" in condition.upper():
                if requires_wheelchair or avoid_stairs:
                    score -= self.config.adverse_weather_penalty
                    warnings.append(f"Adverse weather condition '{condition}' increases route difficulty for mobility preferences")

        # 7. Check Crowd Context
        if crowd:
            level = getattr(crowd, "crowd_level", "")
            if level in ("HEAVY", "CROWDED", "VERY_CROWDED"):
                if getattr(profile, "cognitive_preferences", {}).get("requires_quiet") or requires_wheelchair:
                    score -= self.config.heavy_crowd_penalty
                    warnings.append(f"Heavy crowd observed at target destination or segments")

        # Bound score between 0 and 100
        final_score = int(max(0.0, min(100.0, score)))

        # Determine level
        if final_score >= 80:
            suitability_level = "HIGH"
        elif final_score >= 50:
            suitability_level = "MEDIUM"
        elif final_score >= 20:
            suitability_level = "LOW"
        else:
            suitability_level = "UNKNOWN"

        return {
            "score": final_score,
            "level": suitability_level,
            "reasons": reasons,
            "warnings": warnings
        }
