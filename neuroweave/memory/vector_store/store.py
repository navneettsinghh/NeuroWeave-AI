from __future__ import annotations

from typing import List


class VectorStore:
    def __init__(self) -> None:
        self._memory: List[str] = []

    def upsert(self, item: str) -> None:
        self._memory.append(item)

    def search(self, query: str) -> List[str]:
        return [item for item in self._memory if query.lower() in item.lower()]
