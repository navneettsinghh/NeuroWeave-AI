from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from neuroweave.core.models import Goal


@dataclass
class SimulationResult:
    risk_score: float
    confidence: float
    strategy_scores: Dict[str, float]
    assumptions: List[str]


class DecisionIntelligenceEngine:
    """Runs outcome simulations and strategy comparisons prior to execution."""

    def simulate(self, goal: Goal, strategies: List[str]) -> SimulationResult:
        scores = {strategy: 0.7 for strategy in strategies}
        return SimulationResult(
            risk_score=0.3,
            confidence=0.75,
            strategy_scores=scores,
            assumptions=["default_market_conditions", "stable_response_rates"],
        )
