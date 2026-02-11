from __future__ import annotations

from typing import Dict


class ERPConnector:
    def sync_records(self, payload: Dict[str, str]) -> Dict[str, str]:
        return {"status": "synced", "count": str(len(payload))}
