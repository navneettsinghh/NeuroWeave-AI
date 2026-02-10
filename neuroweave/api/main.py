from __future__ import annotations

from fastapi import FastAPI

from neuroweave.api.routes import execution, goals, plans, simulation, verification

app = FastAPI(title="NeuroWeave AI")

app.include_router(goals.router)
app.include_router(plans.router)
app.include_router(simulation.router)
app.include_router(execution.router)
app.include_router(verification.router)
