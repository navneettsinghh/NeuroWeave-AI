# CONVERTIQ Architecture

```text
Lead Source
    ↓
Normalization
    ↓
Qualification Provider
    ↓
Lead Scoring
    ↓
Follow-Up Policy
    ↓
WhatsApp Provider
    ↓
Opportunity Pipeline
    ↓
Human Agent
```

## Implemented

- Static browser application in `index.html` and `src/app.js`.
- Business configuration in `src/config/business.example.js`.
- Demo data separated in `src/demo-data.js`.
- Normalized lead creation through `normalizeLead()`.
- Duplicate detection by normalized phone and email.
- Transparent lead scoring through `scoreLead(lead, businessConfig)`.
- Deterministic follow-up policy through `evaluateFollowUpPolicy()`.
- Lead activity timeline events through `createActivityEvent()` and `addActivity()`.
- Local validation events in browser `localStorage` for demo interaction analysis.

## Mock

- `MockLeadSource` simulates lead intake.
- `MockRealEstateQualificationProvider` simulates AI qualification, reply generation, summaries, and next-action recommendations.
- `MockWhatsAppProvider` simulates WhatsApp send/template/receive methods.

These are not production integrations.

## Pilot-ready

- Client configuration can change business name, locations, property types, working hours, qualification questions, scoring thresholds, and follow-up policy without rewriting core app logic.
- The app supports DEMO and PILOT modes conceptually; DEMO loads fictional data, while PILOT starts from configuration and client-specific inputs.
- Human takeover remains central and records an audit event.

## Future

- Approved WhatsApp Business/API provider implementation.
- Real lead source webhooks/APIs.
- Production AI provider adapter.
- Durable storage for pilot leads and activity timeline.
- CRM and calendar integrations after pilot validation.
