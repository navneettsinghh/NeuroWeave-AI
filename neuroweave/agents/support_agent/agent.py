from __future__ import annotations

from typing import Any, Dict

from neuroweave.agents.base import Agent


class SupportAgent(Agent):
    name = "support_agent"

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "ticket_triaged", "details": task}
