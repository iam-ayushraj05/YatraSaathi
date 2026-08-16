from datetime import datetime, timezone
from typing import Optional
from app.models.enums import SourceType, VerificationAction
from app.repositories.barrier import VerificationRepository


class TrustService:
    """
    Evaluates the trust/confidence of accessibility records, reports, or barriers.
    Considers source quality, verification status, evidence, recency, and reports.
    """

    def __init__(self, verification_repo: Optional[VerificationRepository] = None):
        self.verification_repo = verification_repo

    async def evaluate_trust(self, entity) -> dict:
        """
        Evaluate trust of a barrier or accessibility record.
        Returns:
            {
                "level": "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN",
                "score": float (0.0 to 1.0),
                "reasons": list[str],
                "details": dict
            }
        """
        reasons = []
        score = 0.5  # Base score

        # 1. Check Source Type
        source = getattr(entity, "source_type", None)
        if source:
            if source == SourceType.EXTERNAL_API.value or source == SourceType.OFFICIAL.value:
                score += 0.3
                reasons.append("Official or external API source")
            elif source == SourceType.AUTHORITY.value or source == SourceType.AUDITOR.value:
                score += 0.25
                reasons.append("Authorized authority/auditor source")
            elif source == SourceType.DEMO.value:
                # Fictional demo data
                score -= 0.2
                reasons.append("Demo/simulation data source")
            elif source == SourceType.USER_REPORTED.value:
                reasons.append("User submitted report")
            elif source == SourceType.AI_ASSISTED.value:
                score += 0.1
                reasons.append("AI-assisted metadata")

        # 2. Check Verifications
        verifications = getattr(entity, "verifications", [])
        # If we have a verification repo and entity is a model instance, we might load them
        if not verifications and self.verification_repo and hasattr(entity, "id"):
            # Try fetching verifications from repo
            if entity.__tablename__ == "barriers":
                verifications = await self.verification_repo.get_verifications_for_barrier(entity.id)
            elif entity.__tablename__ == "reports":
                verifications = await self.verification_repo.get_verifications_for_report(entity.id)

        has_trusted_verification = False
        user_verifications_count = 0

        for v in verifications:
            if v.action == VerificationAction.VERIFY.value:
                # If verifier is admin/moderator (role can be checked, but we assume verifier exists)
                verifier_role = getattr(v.verifier, "role", "USER") if getattr(v, "verifier", None) else "USER"
                if verifier_role in ("ADMIN", "MODERATOR", "TRUSTED_PARTNER"):
                    has_trusted_verification = True
                    score += 0.4
                    reasons.append(f"Verified by authorized personnel ({verifier_role})")
                else:
                    user_verifications_count += 1
            elif v.action == VerificationAction.DISPUTE.value:
                score -= 0.3
                reasons.append("Claim is disputed by user(s)")
            elif v.action == VerificationAction.REJECT.value:
                score -= 0.5
                reasons.append("Claim has been rejected")

        if user_verifications_count > 0:
            boost = min(user_verifications_count * 0.1, 0.3)
            score += boost
            reasons.append(f"Verified by {user_verifications_count} user(s)")

        # 3. Check Evidence
        evidence_list = getattr(entity, "evidence", [])
        if evidence_list:
            score += 0.15
            reasons.append("Supporting evidence uploaded")
            # Check AI confidence in evidence
            max_ai_conf = 0.0
            for ev in evidence_list:
                ai_conf = getattr(ev, "ai_confidence", None)
                if ai_conf is not None:
                    max_ai_conf = max(max_ai_conf, float(ai_conf))
            if max_ai_conf > 0.8:
                score += 0.15
                reasons.append(f"AI analysis confirms evidence with high confidence ({max_ai_conf:.1%})")
            elif max_ai_conf > 0.5:
                score += 0.08
                reasons.append(f"AI analysis confirms evidence with medium confidence ({max_ai_conf:.1%})")

        # 4. Freshness/Recency
        last_verified = getattr(entity, "last_verified_at", None) or getattr(entity, "verified_at", None)
        if not last_verified:
            last_verified = getattr(entity, "updated_at", None) or getattr(entity, "created_at", None)

        if last_verified:
            # ensure datetime is timezone aware
            if last_verified.tzinfo is None:
                last_verified = last_verified.replace(tzinfo=timezone.utc)
            age_days = (datetime.now(timezone.utc) - last_verified).days
            if age_days < 30:
                score += 0.1
                reasons.append("Recently verified/updated (< 30 days)")
            elif age_days > 180:
                score -= 0.2
                reasons.append("Stale data: last verified/updated > 6 months ago")

        # Bound score between 0.0 and 1.0
        score = max(0.0, min(1.0, score))

        # Determine level
        if score >= 0.8:
            level = "HIGH"
        elif score >= 0.5:
            level = "MEDIUM"
        elif score > 0.2:
            level = "LOW"
        else:
            level = "UNKNOWN"

        return {
            "level": level,
            "score": round(score, 2),
            "reasons": reasons,
            "details": {
                "user_verifications": user_verifications_count,
                "has_trusted_verification": has_trusted_verification,
                "source_type": source,
            }
        }
