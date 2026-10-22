# Architecture and data flow

EchoPath is a static Vite/React application with React Router. Tailwind supplies the CSS foundation; `src/styles.css` defines the responsive visual system. `src/ui.tsx` owns the shared application context and reusable cards/navigation elements. `src/App.tsx` loads the library, manages status and feedback, and routes pages. `src/pages.tsx` implements the product flows; `src/store.ts` isolates persistence and API requests. `supabase/functions/_shared/domain.ts` is the single validation and deterministic template source shared by browser and server.

## Demo flow

No Supabase variables configured → ten explicitly fictional records + browser-local submissions → local search/filter → selected detail → deterministic roadmap. Partial or invalid configuration produces an explicit error. Form validation runs before local storage. Insight extraction splits supplied tools and skills, and copies the original advice and lessons, with bounded excerpts for long entries. It is not an AI model. Browser storage operations are acknowledged only after they succeed.

## Persistent flow

Public browser Supabase client → RLS-protected SELECT of `published` + consented experiences and their insights. No fictional seed records are inserted into the database or added to live results. Contributions → Edge Function validation → sanitized name → `pending` database insert with stable request UUID → optional OpenAI extraction → validated separate insight upsert → honest response. Failed processing preserves the original row. Trusted team moderation in Supabase changes status to `published`; no moderation UI or public mutation policy exists.

Roadmap goals + selected UUIDs → Edge Function → reload consented published records on the server → OpenAI Responses API strict JSON → runtime schema check + source-ID/timeline checks → browser-owned roadmap and progress. AI cannot request additional tools or database access. Untrusted record text is passed as data. Content grounding still requires human review. No key configured → explicit template response; enabled AI failure → visible error.

Feedback → validated server insert → private table with no public grants. Demo feedback → local storage. Local analytics store event name, timestamp and demo/live mode only; queries and personal data are not recorded. The export action includes only records from this browser, never server feedback.

## Trust boundaries

The frontend has only a public Supabase key. Service-role and OpenAI credentials are server secrets. An unauthenticated public Edge Function is intentional for the prototype; SQL-backed rate limits constrain requests and AI defaults off. RLS protects direct database access; server input validation protects the service-role path. CORS alone is not a security boundary. Administrative retry extraction requires the service-role bearer secret. Do not expose it through the UI.

Tables: experiences → one AI insight; reserved roadmaps → many tasks; private feedback; private request limits. Foreign keys cascade insight and task deletion. Public read policies follow parent visibility; anonymous users have no write grants. Personal roadmap state is not stored in the reserved tables until a future authenticated ownership design exists.

## Failure and scale boundaries

Configuration errors remain visible, never silently convert live mode to demo. Submissions use a stable UUID to avoid network-retry duplicates. If the response is lost after insert, retrying reports prior receipt. A function crash after insert may require trusted extraction retry. Roadmaps and progress are browser-local; storage failures surface errors. Analytics errors never interrupt a core flow. Search fetches the full published dataset and filters in memory; server pagination is the next scaling step.

Vercel hosts the SPA; Supabase hosts the database and Deno Edge Function. Migration application, hosted key permissions, external API access, gateway limits and production origins must be verified with the owner's environment before live release.
