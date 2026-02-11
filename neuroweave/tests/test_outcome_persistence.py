from pathlib import Path

from neuroweave.core.models import Outcome
from neuroweave.core.persistence import SQLiteModelStore


def test_outcome_persistence_round_trip(tmp_path: Path):
    db_file = tmp_path / "outcomes.db"
    store = SQLiteModelStore(table="outcome_test", model_type=Outcome, db_path=str(db_file))

    outcome = Outcome(
        plan_id="00000000-0000-0000-0000-000000000001",
        success=True,
        metrics={"roi": 2.3, "meetings": 10},
        evidence=["crm_sync_verified"],
        roi=2.3,
    )
    store.set(str(outcome.id), outcome)
    loaded = store.get(str(outcome.id))

    assert loaded is not None
    assert loaded.success is True
    assert loaded.metrics["roi"] == 2.3
