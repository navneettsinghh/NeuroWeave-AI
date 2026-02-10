from neuroweave.core.models import Goal
from neuroweave.core.planner.service import OutcomePlanner


def test_sales_plan_has_dependencies():
    planner = OutcomePlanner()
    goal = Goal(objective="Increase qualified pipeline")
    plan = planner.build_plan(goal)
    assert plan.tasks[1].dependencies
    assert plan.tasks[-1].checkpoint is True
