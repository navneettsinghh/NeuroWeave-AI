from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.schemas.execution import ExecutionResponse
from neuroweave.api.state import PLAN_STORE
from neuroweave.core.orchestrator.runtime import Orchestrator

router = APIRouter(prefix="/execute", tags=["execution"])

orchestrator = Orchestrator()


@router.post("/{plan_id}", response_model=ExecutionResponse)
async def execute_plan(plan_id: str) -> ExecutionResponse:
    plan = PLAN_STORE.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    result = orchestrator.execute(plan)
    return ExecutionResponse(
        execution_id=str(result.state.id),
        status=result.state.status.value,
        history=result.state.history,
        agent_tasks=[task.model_dump() for task in result.agent_tasks],
    )
