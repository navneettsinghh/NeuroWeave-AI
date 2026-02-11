from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.state import OUTCOME_STORE

router = APIRouter(prefix="/outcomes", tags=["outcomes"])


@router.get("/{outcome_id}")
async def get_outcome(outcome_id: str):
    outcome = OUTCOME_STORE.get(outcome_id)
    if not outcome:
        raise HTTPException(status_code=404, detail="Outcome not found")
    return outcome
