from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class RiskTolerance(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Goal(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    objective: str
    constraints: List[str] = Field(default_factory=list)
    success_metrics: Dict[str, Any] = Field(default_factory=dict)
    slas: Dict[str, Any] = Field(default_factory=dict)
    risk_tolerance: RiskTolerance = RiskTolerance.medium
    budget: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PlanTask(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    dependencies: List[UUID] = Field(default_factory=list)
    required_capabilities: List[str] = Field(default_factory=list)
    checkpoint: bool = False


class Plan(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    goal_id: UUID
    strategy: str
    tasks: List[PlanTask]
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentTask(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    plan_id: UUID
    task_id: UUID
    payload: Dict[str, Any]
    required_capabilities: List[str]


class ExecutionStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class ExecutionState(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    plan_id: UUID
    status: ExecutionStatus = ExecutionStatus.pending
    current_task_id: Optional[UUID] = None
    history: List[Dict[str, Any]] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Outcome(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    plan_id: UUID
    success: bool
    metrics: Dict[str, Any] = Field(default_factory=dict)
    evidence: List[str] = Field(default_factory=list)
    roi: Optional[float] = None
    verified_at: datetime = Field(default_factory=datetime.utcnow)


class AuditRecord(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    actor: str
    action: str
    resource_type: str
    resource_id: UUID
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
