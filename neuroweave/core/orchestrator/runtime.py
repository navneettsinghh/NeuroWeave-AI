from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from neuroweave.core.models import AgentTask, ExecutionState, ExecutionStatus, Plan


@dataclass
class OrchestrationResult:
    state: ExecutionState
    agent_tasks: List[AgentTask]


class Orchestrator:
    """Coordinates task execution, retries, and human approvals."""

    def __init__(self) -> None:
        self._assignments: Dict[str, str] = {}

    def assign_agent(self, capability: str, agent_name: str) -> None:
        self._assignments[capability] = agent_name

    def build_agent_tasks(self, plan: Plan) -> List[AgentTask]:
        return [
            AgentTask(
                plan_id=plan.id,
                task_id=task.id,
                payload={"task_name": task.name, "goal_id": str(plan.goal_id)},
                required_capabilities=task.required_capabilities,
            )
            for task in plan.tasks
        ]

    def execute(self, plan: Plan) -> OrchestrationResult:
        state = ExecutionState(plan_id=plan.id, status=ExecutionStatus.running)
        tasks = self.build_agent_tasks(plan)
        state.history.append({"event": "plan_started", "task_count": len(tasks)})
        return OrchestrationResult(state=state, agent_tasks=tasks)
