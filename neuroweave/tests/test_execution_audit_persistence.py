from pathlib import Path

from neuroweave.core.models import AuditRecord, ExecutionState, Plan, ExecutionStatus
from neuroweave.core.persistence import SQLiteModelStore


def test_execution_and_audit_persist(tmp_path: Path):
    db_file = tmp_path / "runtime.db"
    plan = Plan(goal_id="00000000-0000-0000-0000-000000000000", strategy="test", tasks=[])
    execution = ExecutionState(plan_id=plan.id, status=ExecutionStatus.running)
    audit = AuditRecord(
        actor="system",
        action="plan_executed",
        resource_type="plan",
        resource_id=plan.id,
        metadata={"execution_id": str(execution.id)},
    )

    execution_store = SQLiteModelStore(table="exec_test", model_type=ExecutionState, db_path=str(db_file))
    audit_store = SQLiteModelStore(table="audit_test", model_type=AuditRecord, db_path=str(db_file))

    execution_store.set(str(execution.id), execution)
    audit_store.set(str(audit.id), audit)

    loaded_execution = execution_store.get(str(execution.id))
    loaded_audit = audit_store.get(str(audit.id))

    assert loaded_execution is not None
    assert loaded_execution.status == ExecutionStatus.running
    assert loaded_audit is not None
    assert loaded_audit.metadata["execution_id"] == str(execution.id)
