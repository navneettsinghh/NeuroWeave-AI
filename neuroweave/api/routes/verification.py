from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.schemas.verification import OutcomeResponse, VerificationRequest
from neuroweave.api.state import AUDIT_STORE, OUTCOME_STORE, PLAN_STORE
from neuroweave.core.models import AuditRecord
from neuroweave.core.verification.service import OutcomeVerificationEngine

router = APIRouter(prefix="/verify", tags=["verification"])

engine = OutcomeVerificationEngine()


@router.post("/{plan_id}", response_model=OutcomeResponse)
async def verify(plan_id: str, payload: VerificationRequest) -> OutcomeResponse:
    plan = PLAN_STORE.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    outcome = engine.verify(plan, payload.metrics)
    OUTCOME_STORE.set(str(outcome.id), outcome)

    audit = AuditRecord(
        actor="system",
        action="outcome_verified",
        resource_type="outcome",
        resource_id=outcome.id,
        metadata={"plan_id": plan_id, "success": outcome.success},
    )
    AUDIT_STORE.set(str(audit.id), audit)

    return OutcomeResponse(
        outcome_id=str(outcome.id),
        plan_id=str(outcome.plan_id),
        success=outcome.success,
        metrics=outcome.metrics,
        evidence=outcome.evidence,
        roi=outcome.roi,
    )
