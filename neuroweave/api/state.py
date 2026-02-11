from __future__ import annotations

from neuroweave.core.models import Goal, Plan
from neuroweave.core.persistence import SQLiteModelStore

GOAL_STORE = SQLiteModelStore[Goal](table="goals", model_type=Goal)
PLAN_STORE = SQLiteModelStore[Plan](table="plans", model_type=Plan)
