from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.schemas.execution import ExecutionResponse
from neuroweave.api.state import AUDIT_STORE, EXECUTION_STORE, PLAN_STORE
from neuroweave.core.models import AuditRecord
from neuroweave.core.orchestrator.runtime import Orchestrator

router = APIRouter(prefix="/execute", tags=["execution"])

orchestrator = Orchestrator()


@router.post("/{plan_id}", response_model=ExecutionResponse)
async def execute_plan(plan_id: str) -> ExecutionResponse:
    plan = PLAN_STORE.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    result = orchestrator.execute(plan)
    execution_id = str(result.state.id)
    EXECUTION_STORE.set(execution_id, result.state)

    audit = AuditRecord(
        actor="system",
        action="plan_executed",
        resource_type="plan",
        resource_id=plan.id,
        metadata={"execution_id": execution_id, "task_count": len(result.agent_tasks)},
    )
    AUDIT_STORE.set(str(audit.id), audit)

    return ExecutionResponse(
        execution_id=execution_id,
        status=result.state.status.value,
        history=result.state.history,
        agent_tasks=[task.model_dump(mode="json") for task in result.agent_tasks],
    )


@router.get("/{execution_id}")
async def get_execution(execution_id: str):
    execution = EXECUTION_STORE.get(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution
