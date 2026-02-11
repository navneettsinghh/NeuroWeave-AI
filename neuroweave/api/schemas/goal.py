from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from neuroweave.core.models import RiskTolerance


class GoalRequest(BaseModel):
    objective: str
    constraints: List[str] = Field(default_factory=list)
    success_metrics: Dict[str, Any] = Field(default_factory=dict)
    slas: Dict[str, Any] = Field(default_factory=dict)
    risk_tolerance: RiskTolerance = RiskTolerance.medium
    budget: Optional[float] = None


class GoalResponse(BaseModel):
    goal_id: str
    missing_fields: List[str]
