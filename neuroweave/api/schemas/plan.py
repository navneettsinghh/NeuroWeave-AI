from __future__ import annotations

from typing import List

from pydantic import BaseModel


class PlanTaskResponse(BaseModel):
    id: str
    name: str
    description: str
    dependencies: List[str]
    required_capabilities: List[str]
    checkpoint: bool


class PlanResponse(BaseModel):
    plan_id: str
    strategy: str
    tasks: List[PlanTaskResponse]
