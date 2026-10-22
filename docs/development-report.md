# EchoPath development report

## Delivery status

EchoPath is **fully functional locally in demo mode**. It is **not connected to persistent shared storage or a live AI API** in this workspace. The database migration, protected submission workflow and OpenAI integration are implemented and locally tested with embedded PostgreSQL and mocked HTTP transports. Hosted Supabase and real OpenAI verification require the owner's credentials. The production build is Vercel-compatible; no deployment, commit or push was performed.

## Implemented product

Six responsive pages: landing, searchable/filterable experience library, complete experience details, validated four-step contribution form, source-informed preparation roadmap, and About. Ten fictional examples, labeled local submissions, template insight extraction, privacy choices, consent and preview, related experiences, roadmap progress and print-to-PDF, private feedback, browser-local analytics and report export are functional.

Persistent mode reads only published consented database records and submits privately for moderation. A secure Deno function validates input, forces pending status, sanitizes contributor names, handles idempotent retries, preserves original submissions when extraction fails, validates structured AI output, validates roadmap citations/timelines, and applies database-backed hourly quotas. Trusted extraction retry is included. Credentials never belong in frontend code.

## Stack

React 19 / TypeScript 6 / Vite 8 / Tailwind CSS 4 / React Router 7 / Lucide / Zod 4 / Supabase / Deno / OpenAI Responses structured outputs. Exact dependency versions are pinned in `package.json` and `package-lock.json`.

## Files

- Application: `src/App.tsx`, `src/main.tsx`, `src/ui.tsx`, `src/pages.tsx`, `src/styles.css`, `src/data.ts`, `src/domain.ts`, `src/store.ts`.
- Backend: `supabase/config.toml`, `supabase/migrations/202610190001_initial.sql`, `supabase/functions/_shared/domain.ts`, `supabase/functions/echopath/index.ts`, `deno.json`, `deno.lock`, `index_test.ts`.
- Tests: `tests/setup.ts`, `app.test.tsx`, `config.test.ts`, `domain.test.ts`, `store.test.ts`, `live-adapter.test.ts`, `database.test.ts`, `tests/e2e/journey.spec.ts`.
- Setup: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `playwright.config.ts`, `vercel.json`, `.env.example`, `.gitignore`.
- Documentation: `README.md`, `docs/architecture.md`, `demo-script.md`, `user-testing.md`, `mvp-checklist.md`, `competition-evidence.md`, this report.

## Executed verification

| Command                         | Result                                                    |
| ------------------------------- | --------------------------------------------------------- |
| Dependency installation / audit | Successful; npm reported 0 vulnerabilities                |
| `npm run typecheck`             | Passed                                                    |
| `npm run lint`                  | Passed                                                    |
| `npm test`                      | 24 tests passed in 6 files                                |
| `npm run check:server`          | Edge Function Deno type checking passed                   |
| `npm run test:server`           | 11 mocked server HTTP tests passed                        |
| `npm run test:e2e`              | 6 browser tests passed across desktop and mobile Chromium |
| `npm run build`                 | Production build succeeded                                |

Unit/component coverage includes app rendering, navigation/search, filtering/sorting, consent validation, valid fictional records, extraction schema validation, roadmaps with/without evidence, browser-local persistence, corrupt/blocked storage, feedback, analytics privacy and invalid connection settings. Embedded PostgreSQL executes the migration and checks published-only reading, denied public mutations/private-table access and quota enforcement. The embedded test omits only the unavailable pgcrypto extension declaration; core UUID generation remains functional.

Server HTTP tests use mocked database/provider transports. They verify insert-before-extraction ordering, honest failure results, valid versus invalid insight storage, privacy sanitization, published-source reloads, invalid citation rejection, missing-evidence rejection, template fallback, feedback field filtering and request restrictions. These are not proof of a hosted integration.

Browser tests cover the complete contribution/search/detail/roadmap/feedback journey, reload persistence, all ten fictional detail routes, no-results/reset behavior, responsive horizontal bounds, and axe WCAG A/AA checks on home, library, share, roadmap and About pages. Desktop/mobile landing screenshots were visually reviewed. Safari, assistive-technology testing and real student testing remain outstanding.

## Exact local commands

With a normal Node 22.12+ installation:

```sh
npm ci
npm run dev
```

In this workspace, if Node is not on PATH:

```powershell
cd C:\Users\ryany\EchoPath
$env:PATH="$PWD\.tools\node-v24.22.0-win-x64;$env:PATH"
npm.cmd run dev
```

Open http://127.0.0.1:5173. No credentials are needed for demo mode. For future browser installs inside the workspace, set `PLAYWRIGHT_BROWSERS_PATH` to `$PWD\.tools\playwright` before both installation and tests. Tooling note: the initial npm/Playwright installations used their standard user cache directories, including `%LOCALAPPDATA%\ms-playwright`; application/source changes are inside EchoPath. This incidental cache write exceeded the requested project-only file boundary; subsequent browser-install instructions use the project-local path.

## Required external setup and next steps

1. Configure an owner-controlled Supabase project, apply the SQL migration, deploy the function and set its exact allowed origin. Add the two public frontend variables and verify real inserts, private pending records, publication and private feedback.
2. Set server-only `OPENAI_API_KEY`, `OPENAI_MODEL`, and `AI_ENABLED=true`. Verify extraction, failure/retry and cited roadmaps against the real provider. No live calls have been made in this workspace.
3. Recruit 2–3 students using the provided testing protocol. Record genuine findings and a feedback-driven product modification. Evidence placeholders are intentionally unfilled.
4. Review moderation, deletion/retention operations, provider spending controls and public endpoint abuse controls. Add stronger authentication/CAPTCHA and gateway quotas before broad public use.
5. Obtain separate authorization to commit, push or deploy. Verify production deep links and allowed origin after any future deployment.

Intentional limits: browser-owned roadmaps and local analytics; no cross-device synchronization, contributor editing or public admin dashboard; full-library client-side filtering; AI requires human factual review; browser tests use Chromium only. See README for detailed setup and security notes.
