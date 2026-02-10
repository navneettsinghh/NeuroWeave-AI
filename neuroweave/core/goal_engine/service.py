from __future__ import annotations

from typing import Any, Dict, List

from neuroweave.core.models import Goal, RiskTolerance


class GoalIntakeEngine:
    """Converts plain language input into a structured Goal model."""

    def normalize(
        self,
        objective: str,
        constraints: List[str] | None = None,
        success_metrics: Dict[str, Any] | None = None,
        slas: Dict[str, Any] | None = None,
        risk_tolerance: RiskTolerance = RiskTolerance.medium,
        budget: float | None = None,
    ) -> Goal:
        return Goal(
            objective=objective,
            constraints=constraints or [],
            success_metrics=success_metrics or {},
            slas=slas or {},
            risk_tolerance=risk_tolerance,
            budget=budget,
        )
