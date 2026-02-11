from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel


class VerificationRequest(BaseModel):
    metrics: Dict[str, float]


class OutcomeResponse(BaseModel):
    outcome_id: str
    plan_id: str
    success: bool
    metrics: Dict[str, float]
    evidence: List[str]
    roi: Optional[float] = None
