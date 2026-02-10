from __future__ import annotations

from typing import Dict


class EmailConnector:
    def send_email(self, payload: Dict[str, str]) -> Dict[str, str]:
        return {"status": "sent", "recipients": payload.get("to", "")}
