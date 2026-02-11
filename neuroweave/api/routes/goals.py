from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.schemas.goal import GoalRequest, GoalResponse
from neuroweave.api.state import GOAL_STORE
from neuroweave.core.goal_engine.service import GoalIntakeEngine

router = APIRouter(prefix="/goals", tags=["goals"])

goal_engine = GoalIntakeEngine()


@router.post("", response_model=GoalResponse)
async def create_goal(payload: GoalRequest) -> GoalResponse:
    goal = goal_engine.normalize(
        objective=payload.objective,
        constraints=payload.constraints,
        success_metrics=payload.success_metrics,
        slas=payload.slas,
        risk_tolerance=payload.risk_tolerance,
        budget=payload.budget,
    )
    GOAL_STORE.set(str(goal.id), goal)
    missing_fields = []
    if not payload.success_metrics:
        missing_fields.append("success_metrics")
    if not payload.slas:
        missing_fields.append("slas")
    return GoalResponse(goal_id=str(goal.id), missing_fields=missing_fields)


@router.get("/{goal_id}")
async def get_goal(goal_id: str):
    goal = GOAL_STORE.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal
