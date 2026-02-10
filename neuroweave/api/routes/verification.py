from __future__ import annotations

from typing import Dict

from fastapi import APIRouter, HTTPException

from neuroweave.api.state import PLAN_STORE
from neuroweave.core.verification.service import OutcomeVerificationEngine

router = APIRouter(prefix="/verify", tags=["verification"])

engine = OutcomeVerificationEngine()


@router.post("/{plan_id}")
async def verify(plan_id: str, metrics: Dict[str, float]):
    plan = PLAN_STORE.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    outcome = engine.verify(plan, metrics)
    return outcome
