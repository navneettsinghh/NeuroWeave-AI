from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict


class Agent(ABC):
    name: str

    @abstractmethod
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError
