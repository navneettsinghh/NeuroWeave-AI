# NeuroWeave AI — Outcome-as-Agentic-Solution (OaAS)

NeuroWeave AI is an enterprise-grade autonomous AI workflow orchestration platform that converts plain-language business goals into **verified business outcomes**. It plans, simulates, orchestrates, executes, and validates workflows using specialist agents and secure enterprise integrations.

## Mission
Deliver **Outcome-as-Agentic-Solution (OaAS)**: AI systems that own results end-to-end, not just recommendations.

## Core Capabilities
1. **Goal Intake Engine** — Normalizes natural language objectives into structured, auditable goals.
2. **Decision Intelligence** — Simulates outcomes, compares strategies, and scores risk before execution.
3. **Outcome Planner** — Builds task DAGs with dependencies, checkpoints, and missing-data detection.
4. **Agent Orchestration Kernel** — Coordinates agents, retries, escalation, and approvals.
5. **Specialist Agents** — Sales, support, compliance, market intel, and ops agents with standardized schemas.
6. **Enterprise Integrations** — CRM/ERP/ticketing/email connectors with audit logging and RBAC.
7. **Outcome Verification** — Confirms success metrics, evidence, and ROI.

## MVP Focus: Autonomous Sales Outcome Engine
The initial MVP delivers a fully automated sales pipeline:
- Prospect research
- Lead scoring
- Automated outreach
- CRM update
- Outcome verification

## Repository Structure
```
neuroweave/
  core/
    goal_engine/
    planner/
    orchestrator/
    verification/
    simulation/

  agents/
    sales_agent/
    support_agent/
    compliance_agent/
    ops_agent/
    market_agent/

  integrations/
    crm/
    erp/
    ticketing/
    email/

  memory/
    vector_store/
    knowledge_graph/

  api/
    routes/
    schemas/

  infra/
    docker/
    k8s/

  tests/
```

## Quickstart
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export NEUROWEAVE_DB_PATH=.data/neuroweave.db
uvicorn neuroweave.api.main:app --reload
```

## Key API Endpoints
- `POST /goals` — create a structured goal
- `POST /simulate/{goal_id}` — run decision intelligence simulation
- `POST /plans/{goal_id}` — generate a task DAG
- `POST /execute/{plan_id}` — orchestrate execution
- `GET /execute/{execution_id}` — fetch execution state
- `POST /verify/{plan_id}` — verify outcomes
- `GET /audits/{audit_id}` — fetch deterministic audit evidence

## Tech Stack
- **Backend**: Python, FastAPI, Pydantic
- **Workflow Engine**: Temporal-compatible orchestration abstractions
- **Data**: SQLite persistence (implemented), PostgreSQL/Redis (next)
- **AI Layer**: Modular LLM routing + tool calling (scaffolded)
- **Deployment**: Docker + Kubernetes templates
- **Security**: OAuth, RBAC, secrets manager, audit logs

## Next Steps
- Upgrade SQLite persistence to PostgreSQL + Redis queue.
- Add Temporal workflows for distributed execution.
- Expand agent toolkits and integrations.
- Build observability (OpenTelemetry traces + metrics).
