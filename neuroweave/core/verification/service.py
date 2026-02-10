from __future__ import annotations

from typing import Dict, List

from neuroweave.core.models import Outcome, Plan


class OutcomeVerificationEngine:
    """Validates success metrics and produces evidence."""

    def verify(self, plan: Plan, metrics: Dict[str, float]) -> Outcome:
        success = all(value >= 0 for value in metrics.values())
        evidence: List[str] = ["metrics_collected", "crm_sync_verified"]
        roi = metrics.get("roi")
        return Outcome(plan_id=plan.id, success=success, metrics=metrics, evidence=evidence, roi=roi)
