from pathlib import Path

from neuroweave.core.models import Goal
from neuroweave.core.persistence import SQLiteModelStore


def test_sqlite_model_store_round_trip(tmp_path: Path):
    db_file = tmp_path / "test.db"
    store = SQLiteModelStore(table="goals_test", model_type=Goal, db_path=str(db_file))
    goal = Goal(objective="Increase pipeline", success_metrics={"meetings": 20})

    store.set(str(goal.id), goal)
    loaded = store.get(str(goal.id))

    assert loaded is not None
    assert loaded.id == goal.id
    assert loaded.success_metrics["meetings"] == 20
