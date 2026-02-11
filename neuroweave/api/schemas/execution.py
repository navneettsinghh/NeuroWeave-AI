from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel


class ExecutionResponse(BaseModel):
    execution_id: str
    status: str
    history: List[Dict[str, Any]]
    agent_tasks: List[Dict[str, Any]]
