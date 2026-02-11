from __future__ import annotations

from fastapi import APIRouter, HTTPException

from neuroweave.api.state import AUDIT_STORE

router = APIRouter(prefix="/audits", tags=["audits"])


@router.get("/{audit_id}")
async def get_audit_record(audit_id: str):
    record = AUDIT_STORE.get(audit_id)
    if not record:
        raise HTTPException(status_code=404, detail="Audit record not found")
    return record
