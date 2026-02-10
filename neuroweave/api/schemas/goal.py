from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from neuroweave.core.models import RiskTolerance


class GoalRequest(BaseModel):
    objective: str
    constraints: List[str] = []
    success_metrics: Dict[str, Any] = {}
    slas: Dict[str, Any] = {}
    risk_tolerance: RiskTolerance = RiskTolerance.medium
    budget: Optional[float] = None


class GoalResponse(BaseModel):
    goal_id: str
    missing_fields: List[str]
