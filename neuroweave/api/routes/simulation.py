from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.schemas.simulation import SimulationRequest, SimulationResponse
from neuroweave.api.state import GOAL_STORE
from neuroweave.core.simulation.decision_intelligence import DecisionIntelligenceEngine

router = APIRouter(prefix="/simulate", tags=["simulation"])

engine = DecisionIntelligenceEngine()


@router.post("/{goal_id}", response_model=SimulationResponse)
async def simulate(goal_id: str, payload: SimulationRequest) -> SimulationResponse:
    goal = GOAL_STORE.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    result = engine.simulate(goal, payload.strategies)
    return SimulationResponse(
        risk_score=result.risk_score,
        confidence=result.confidence,
        strategy_scores=result.strategy_scores,
        assumptions=result.assumptions,
    )
