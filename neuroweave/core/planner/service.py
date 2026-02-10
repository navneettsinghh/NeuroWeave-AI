from __future__ import annotations

from typing import List

from neuroweave.core.models import Goal, Plan, PlanTask


class OutcomePlanner:
    """Builds a task DAG and checkpoints for a goal."""

    def build_plan(self, goal: Goal, strategy: str = "sales-mvp") -> Plan:
        tasks = self._sales_mvp_tasks(goal)
        return Plan(goal_id=goal.id, strategy=strategy, tasks=tasks)

    def detect_missing_data(self, goal: Goal) -> List[str]:
        missing = []
        if not goal.success_metrics:
            missing.append("success_metrics")
        if not goal.slas:
            missing.append("slas")
        return missing

    def _sales_mvp_tasks(self, goal: Goal) -> List[PlanTask]:
        research = PlanTask(
            name="prospect_research",
            description="Identify and enrich target prospects.",
            required_capabilities=["lead_enrichment", "data_research"],
        )
        scoring = PlanTask(
            name="lead_scoring",
            description="Score leads based on fit and intent.",
            dependencies=[research.id],
            required_capabilities=["scoring", "analytics"],
        )
        outreach = PlanTask(
            name="automated_outreach",
            description="Send tailored outreach sequences.",
            dependencies=[scoring.id],
            required_capabilities=["email", "sequencing"],
            checkpoint=True,
        )
        crm_update = PlanTask(
            name="crm_update",
            description="Update CRM with activity and next steps.",
            dependencies=[outreach.id],
            required_capabilities=["crm"],
        )
        verification = PlanTask(
            name="outcome_verification",
            description="Verify pipeline outcomes and SLA adherence.",
            dependencies=[crm_update.id],
            required_capabilities=["verification", "analytics"],
            checkpoint=True,
        )
        return [research, scoring, outreach, crm_update, verification]
