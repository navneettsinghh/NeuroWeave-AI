from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.schemas.plan import PlanResponse, PlanTaskResponse
from neuroweave.api.state import GOAL_STORE, PLAN_STORE
from neuroweave.core.planner.service import OutcomePlanner

router = APIRouter(prefix="/plans", tags=["plans"])

planner = OutcomePlanner()


@router.post("/{goal_id}", response_model=PlanResponse)
async def create_plan(goal_id: str) -> PlanResponse:
    goal = GOAL_STORE.get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    plan = planner.build_plan(goal)
    PLAN_STORE[str(plan.id)] = plan
    task_responses = [
        PlanTaskResponse(
            id=str(task.id),
            name=task.name,
            description=task.description,
            dependencies=[str(dep) for dep in task.dependencies],
            required_capabilities=task.required_capabilities,
            checkpoint=task.checkpoint,
        )
        for task in plan.tasks
    ]
    return PlanResponse(plan_id=str(plan.id), strategy=plan.strategy, tasks=task_responses)


@router.get("/{plan_id}")
async def get_plan(plan_id: str):
    plan = PLAN_STORE.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan
