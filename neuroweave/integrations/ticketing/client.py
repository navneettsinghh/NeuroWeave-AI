from __future__ import annotations

from typing import Dict


class TicketingConnector:
    def create_ticket(self, payload: Dict[str, str]) -> Dict[str, str]:
        return {"status": "created", "ticket_id": "TCK-001"}
