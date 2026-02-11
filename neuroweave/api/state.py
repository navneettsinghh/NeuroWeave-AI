from __future__ import annotations

from neuroweave.core.models import AuditRecord, ExecutionState, Goal, Plan
from neuroweave.core.persistence import SQLiteModelStore

GOAL_STORE = SQLiteModelStore[Goal](table="goals", model_type=Goal)
PLAN_STORE = SQLiteModelStore[Plan](table="plans", model_type=Plan)
EXECUTION_STORE = SQLiteModelStore[ExecutionState](table="executions", model_type=ExecutionState)
AUDIT_STORE = SQLiteModelStore[AuditRecord](table="audit_records", model_type=AuditRecord)
