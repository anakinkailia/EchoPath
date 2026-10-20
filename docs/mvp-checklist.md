# MVP readiness checklist

## Implemented

- [x] Responsive six-page React/TypeScript application and complete navigation.
- [x] Ten complete, fictional sample experiences and clear demo/local/live provenance.
- [x] Combined search, all requested filters, sorting, empty/reset/loading/error states.
- [x] Experience detail sections, source-specific insights, related experiences.
- [x] Guided four-step form, validation, privacy, consent, preview, fictional autofill, duplicate protection.
- [x] Browser-local demo saves and deterministic extraction.
- [x] Supabase SQL migration, RLS/grants, indexes, constraints, safe pending submission backend.
- [x] Server-only OpenAI structured extraction with original preservation and trusted retry.
- [x] Selected-evidence roadmaps, template fallback, general advice labels, timelines, checkboxes, local progress and printing.
- [x] Anonymous private feedback, browser-local analytics and local JSON export.
- [x] Automated unit/component/PostgreSQL policy/browser tests and accessibility checks configured.
- [x] Architecture, setup, demo, testing, evidence and deployment documentation.

## External verification required

- [ ] Owner supplies Supabase project URL and public key; applies migration and deploys Edge Function.
- [ ] Confirm actual insert, pending visibility, moderation publication and private feedback with hosted PostgREST.
- [ ] Owner configures server-only OpenAI key/model and explicitly enables AI; confirm extraction, retry and source-grounded roadmap with live API.
- [ ] Test production origin, quotas, provider errors, cold starts and cost controls.
- [ ] Conduct 2–3 real student sessions, collect permissioned evidence, and make a feedback-driven iteration.
- [ ] Authorize and perform deployment separately. No commit, push or deployment has been performed.

## Intentional MVP limitations

- No contributor login, editing, cross-device roadmap sync, public moderation UI or private feedback dashboard. Trusted team uses Supabase administration.
- AI outputs require human review; schema validation does not establish factual correctness.
- Local analytics are not centralized production analytics. Exports include this browser only.
- Library queries load all published records; pagination/server filtering is future scaling work.
- Browser tests use desktop/mobile Chromium; manual screen reader and Safari testing remain.
- Public prototype endpoint quotas are basic abuse controls, not a comprehensive production anti-abuse system.

See README for commands and the final development report for checks actually executed. Configuration alone does not establish that an external integration works.
