from __future__ import annotations

from typing import Dict, List


class KnowledgeGraph:
    def __init__(self) -> None:
        self._edges: Dict[str, List[str]] = {}

    def add_edge(self, source: str, target: str) -> None:
        self._edges.setdefault(source, []).append(target)

    def neighbors(self, node: str) -> List[str]:
        return self._edges.get(node, [])
