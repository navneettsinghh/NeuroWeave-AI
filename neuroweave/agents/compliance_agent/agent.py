from __future__ import annotations

from typing import Any, Dict

from neuroweave.agents.base import Agent


class ComplianceAgent(Agent):
    name = "compliance_agent"

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "validated", "details": task}
