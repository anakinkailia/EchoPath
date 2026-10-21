# EchoPath

**Real experiences. Smarter next steps.** A responsive experience library and preparation planner for the USC Marshall MS Business Analytics community. Independent student prototype; not an official USC service.

## Status

Fully functional locally in clearly labeled **demo mode**. Supabase persistence and a secure OpenAI integration are implemented, but have **not been connected to a hosted project or tested with live credentials**. No accounts, paid resources, commits, pushes, or deployments were created. Fictional entries are not verified alumni accounts or competition research.

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended) and npm:

```sh
npm ci
npm run dev
```

Open the address printed by Vite, normally http://127.0.0.1:5173. No `.env` is needed for demo mode. For this Windows workspace, a portable Node runtime was downloaded to the ignored `.tools` directory. If Node is not on PATH:

```powershell
$env:PATH="$PWD\.tools\node-v24.22.0-win-x64;$env:PATH"
npm.cmd run dev
```

## Product features

- Landing page, experience library, dedicated detail pages, four-step contribution form, preparation roadmap, About page, feedback dialog, and working mobile navigation.
- Ten complete fictional examples with explicit provenance. Combined text search, experience type, industry, role category, skill and year filters; recent, company and role sorting; related experiences.
- Explore includes timed daily/weekly SOPs, named deliverables, role-specific technical methods, QA checks, and preparation exercises. Ten original synthetic work samples have previews, downloads, and expected review checks. Public insider accounts and primary technical references are linked separately from fictional scenarios; no verified MSBA submissions are claimed.
- Required-field validation, privacy choices, explicit sharing consent, full preview, duplicate request protection, honest save status, and a fictional example autofill for fast demonstrations.
- Original experience text retained separately from validated extraction. Demo extraction is deterministic; no fake AI delays.
- Goals, existing/target skills, 1–12 preparation weeks, up to five evidence records, technical/business preparation, practice projects, interview preparation, weekly milestones, checkboxes, browser-local progress, source links, and print-to-PDF.
- Private anonymous feedback; browser-local event counts and JSON report export. Search text and user identifiers are not tracked.
- Loading skeletons, empty/error states, error boundary, toasts, native modal focus management, reduced-motion support and print styles.

## Stack and organization

React 19, TypeScript 6, Vite 8, Tailwind CSS 4 with custom design tokens/styles, React Router 7, Lucide React, Zod 4, Supabase JavaScript client, a Deno Edge Function, and OpenAI Responses API structured outputs. Dependencies are pinned; `package-lock.json` is included. Vitest, React Testing Library, Playwright, axe and PGlite cover logic, components, browser flows, accessibility and PostgreSQL policies.

```text
src/                          UI, fictional records, persistence adapter
supabase/functions/_shared/    Shared runtime validation and demo logic
supabase/functions/echopath/   Server-only AI, submissions and private feedback
supabase/migrations/          SQL schema, constraints, indexes, RLS and rate limits
tests/                        Unit, component, database and browser tests
docs/                         Architecture, demo, testing and evidence materials
```

Experience narratives live in `src/data.ts`; `src/experience-playbooks.ts` contains original work samples, detailed technical skill lists, and source links checked October 20, 2026. Search includes projects, daily routines, challenges, and solutions. Contribution prompts ask for input → operation → QA → output → handoff details and support short permitted or synthetic work samples pasted into the existing text fields. File uploads are not implemented.

## Skill calendar (AI planner)

`/roadmap` is a three-step skill calendar: pick a skill drawn from the library, pick a scenario, then get a four-week calendar. Plans come from `api/plan.ts`, a Vercel Function that calls a Claude Sonnet model through Poe's OpenAI-compatible API (`POE_MODEL`, default `claude-sonnet-5.5`). The key is server-only: run `bash scripts/set-poe-key.sh` to store `POE_API_KEY` in `.env.local` (for `npm run dev`, which serves `api/` through a Vite middleware) and in Vercel production. Never prefix it with `VITE_`. The endpoint refuses cross-origin requests and validates input and model output; if the AI is unavailable the UI offers a clearly labeled template plan. Plans and task progress are stored in the browser, and calendars export as `.ics`.

## Demo data and storage

With both Supabase frontend variables unset, the library contains ten fictional examples plus submissions stored under `echopath:submissions` in this browser. Partial or invalid connection settings show a configuration error instead of switching to demo data. Local submissions are labeled separately from fictional records. They are not shared with any server. Roadmaps, task progress, event counts and feedback are browser-local. Demo and live roadmap keys are separate. Events include a mode label.

Use **Fill fictional demo example** on the contribution page, continue through the steps, review, then consent. The saved detail page displays template-extracted insights. From a detail page select **Build my preparation roadmap** to preselect that experience.

The footer's **Export local report** downloads only this browser's event and feedback records. It does not expose server feedback. Clear browser site data to remove local content. No research findings or usage statistics are fabricated.

## Supabase setup (manual external setup)

1. Create/select your own Supabase project. Install the Supabase CLI according to its official instructions and authenticate yourself.
2. Apply `supabase/migrations/202610190001_initial.sql` using the Supabase SQL editor, or link the project with the CLI and run `supabase db push`. Back up an existing database first; this migration is intended for a fresh project.
3. Copy `.env.example` to `.env.local` and set the **public** project URL and publishable/legacy anon key:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
   ```

4. Set Edge Function secrets. Use the **exact frontend origin**, including protocol and port (127.0.0.1 and localhost differ):

   ```sh
   supabase secrets set ALLOWED_ORIGIN=http://127.0.0.1:5173 AI_ENABLED=false
   supabase functions deploy echopath
   ```

   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. `supabase/config.toml` disables gateway JWT verification because this MVP accepts unauthenticated submissions. The handler validates all input, restricts actions, controls status server-side, and applies database-backed request quotas. CORS is an origin restriction, not authentication.

5. Restart Vite. The app now loads **only published real database records**, not fictional samples. Misconfigured credentials produce an error and never silently switch back to demo data.
6. Submit an experience. Confirm it exists with `status='pending'` in the trusted Supabase dashboard. It must remain unreadable using a public client. Review for privacy and accuracy, then set its status to `published` in the trusted SQL editor/table editor. Refresh the library.
7. Confirm feedback rows are present in the dashboard and cannot be read with an anon key. Review/export private server feedback using trusted Supabase administration only.

## OpenAI setup (server-side only)

```sh
supabase secrets set OPENAI_API_KEY=YOUR_KEY OPENAI_MODEL=gpt-4o-mini AI_ENABLED=true
```

Never place the OpenAI key or Supabase service-role key in frontend source, a Vite variable, a screenshot or version control. Set a suitable spending limit in your own provider account before enabling public AI access.

The function uses the Responses API with strict JSON schema derived from the same Zod schemas used for runtime validation. `store:false` is sent. Requests have a 45-second timeout. An experience is inserted **before** extraction. If OpenAI or insight storage fails, the original remains pending and the UI reports processing failure without claiming AI success. Without a key or `AI_ENABLED=true`, submissions remain unprocessed and roadmap requests return an explicitly labeled template fallback. When an enabled provider errors, roadmap generation shows an error; it does not disguise a template as AI.

The trusted team can retry extraction by POSTing `{"action":"retry-extraction","id":"EXPERIENCE_UUID"}` to the function with `Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY`. This is an administrative server/CLI action; never expose that credential in a browser. All successful extractions upsert a separate `ai_insights` row with model and generation timestamp. Moderators should review original and extracted content together.

See the [official OpenAI structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) and [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Security and operational limits

- RLS and SQL grants allow public SELECT only on consented published experiences and their insights. There are no public insert, update or delete grants. Pending records are private.
- The Edge Function uses the service role only on the server. It validates fields, ignores client status/insight properties, sanitizes display identity and forces `pending` status. Stable client UUIDs make retries idempotent.
- Feedback has no public read/write grants; validated submission is through the function only. Stored text is rendered as React text, never injected HTML.
- Roadmaps/tasks have reserved tables without public grants or policies. Anonymous progress deliberately stays in local storage rather than publicly writable database records. There is no cross-device synchronization or contributor editing in this MVP.
- Hourly database-backed limits: 20 submissions, 20 feedback requests, 5 roadmap requests per salted IP hash. Expired limiter records are deleted on subsequent requests. IP headers depend on the trusted gateway; quotas can group users behind NAT and are not a substitute for a production anti-abuse service. AI is disabled unless explicitly enabled. Add CAPTCHA/authentication, gateway-wide quotas, monitoring, and stronger cost controls before broad public launch.
- A full library is fetched and then filtered locally. This is appropriate for an MVP dataset; add server-side pagination and query filters before growing the corpus. No vector infrastructure is used.
- Browser data belongs to the current browser profile and is not encrypted. Avoid entering personal/sensitive content in roadmap goals or local feedback. Use trusted administration to delete or unpublish live submissions upon request.
- Shared schemas validate structure, not truth. AI may misinterpret a source. Source references and contributor text are visible for verification; the prototype cannot guarantee factual attribution.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run check:server
npm run test:server
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

For all future browser installs to stay inside the project on PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.tools\playwright"
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

The same environment variable must be set when running those tests. To keep Deno's dependency cache local, set `DENO_DIR` to `.tools/deno-cache` before server checks/tests. Server HTTP tests mock the Supabase and OpenAI transports; they check insert failures, preservation after AI failure, structured output validation, privacy sanitization and request restrictions without calling external services. PGlite runs the actual migration against embedded PostgreSQL, omitting only `create extension pgcrypto` because core `gen_random_uuid()` is available. This checks SQL and access policies, not hosted PostgREST/gateway behavior. Browser tests run desktop and mobile Chromium; WebKit/Safari has not been tested. Screenshots/traces go to ignored `test-results/`.

## Vercel deployment preparation

No deployment has been performed. After live integration verification, import the repository into Vercel, choose Vite, build with `npm run build`, output `dist`, and configure only the two public Supabase frontend variables. Use Node 24. `vercel.json` supplies SPA navigation rewrites. Deploy the database and function separately through Supabase, set `ALLOWED_ORIGIN` to your final HTTPS origin, and confirm deep links and server feedback privacy after deployment. Secrets belong in Supabase, not Vercel's public frontend environment.

## Before judging or public release

Follow `docs/demo-script.md`, test with 2–3 actual students using `docs/user-testing.md`, and record genuine findings in `docs/competition-evidence.md`. Connect your own credentials to validate live extraction and persistence end to end. Review AI output, moderation operations, rate limits, data retention, model access and costs. See `docs/mvp-checklist.md` for remaining external work.
