# CONVERTIQ Integration Roadmap

Do not implement these until a paid pilot requires them and the client has provided approved access.

## WhatsApp

Use an approved WhatsApp Business/API provider. The production adapter should implement the existing provider methods:

- `sendMessage(to, message)`
- `sendTemplate(to, templateName, variables)`
- `receiveMessage(payload)`

Do not scrape WhatsApp Web, automate consumer WhatsApp unofficially, or bypass platform restrictions.

## AI

Replace the mock AI provider with a provider-neutral adapter implementing:

- `qualifyLead(lead, conversation, businessConfig)`
- `generateReply(lead, conversation, businessConfig)`
- `summarizeLead(lead, businessConfig)`
- `recommendNextAction(lead, businessConfig)`

Keep prompts and provider credentials outside UI components.

## Lead Sources

Future webhook/API adapters should implement:

- `receiveLead()`
- `normalizeLead(rawLead)`

Possible future sources include website forms, ad lead forms, property portals, and social channels. Do not build these until client validation defines the exact source.

## CRM

A future CRM adapter can sync normalized leads, statuses, activities, and assignment data after the pilot proves value.

## Calendar

A future calendar adapter can create or confirm property viewing appointments after the human agent approves the action.
