from __future__ import annotations

from typing import Dict, List

from pydantic import BaseModel


class SimulationRequest(BaseModel):
    strategies: List[str]


class SimulationResponse(BaseModel):
    risk_score: float
    confidence: float
    strategy_scores: Dict[str, float]
    assumptions: List[str]
