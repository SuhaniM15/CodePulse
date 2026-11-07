# CodePulse frontend handoff

Read this first. A new developer or AI agent should be able to continue from here without guessing.

Last updated: after housekeeping and Phase 0 (7 Nov 2026).

## Current implementation phase

**Phase 0 (scaffold) is complete and awaiting review.** Next: **Phase 1** (types review, mock fixtures, `featureDefinitions.ts`). Do not start it until the project lead approves.

Git: all work is local and uncommitted on `main`. The project lead commits after each phase. Nothing may be committed, pushed, branched or tagged by an agent.

## How to run locally

See [README.md](./README.md). Short version:

```powershell
cd frontend
pnpm install
copy .env.example .env     # VITE_USE_MOCK=true gives sample fixtures
pnpm dev                   # http://localhost:5173
pnpm build                 # tsc -b + vite build
pnpm lint                  # oxlint
```

pnpm is the package manager. Keep `pnpm-lock.yaml`.

## What is completed

### Housekeeping
- `tsconfig.app.json`: removed `baseUrl` (TypeScript 7 rejects it); `paths` only. `tsconfig.json` also declares the `@/*` path so the shadcn CLI can resolve it.
- `index.html`: title is "CodePulse"; favicon replaced (the Vite logo was removed).
- `package.json`: name is `codepulse-frontend`.
- Deleted Vite template leftovers: `src/App.css`, `src/assets/*`, `public/icons.svg`, and the `src/mocks/index.ts` barrel. The template README was replaced.
- `vite.config.ts`: uses `import.meta.dirname` (removes the `__dirname` warning).
- `.oxlintrc.json`: `react/only-export-components` is off for `src/components/ui/**` (shadcn files export variant helpers).
- Design tokens (`src/theme/tokens.css`): palette as specified; radius tokens (table 0, control 4, chip 2, panel 6, dialog 8); shadows reduced to `--cp-shadow-sm` (strip) and `--cp-shadow-md` (dialogs); `--cp-shadow-xs` and the `--cp-space-*` scale removed (Tailwind covers spacing).
- Notice colours (amber, light blue, slate) exist only as `--cp-notice-*` tokens and are used only inside `Notice`.
- `src/index.css`: `@import "tailwindcss"` is first. shadcn variables are mapped onto the `--cp-*` tokens. Tailwind's built-in shadows are set to `none`; the only shadow utilities are `shadow-strip` and `shadow-dialog`. The global `.font-mono` override is replaced by a dedicated `.commit-id` class (JetBrains Mono, commit IDs only). The duplicate `.tabular-nums` rule is removed (Tailwind's built-in utility is used). Fonts are latin subsets only. Global `:focus-visible` outline; `prefers-reduced-motion` respected.
- `.env.example` added (`VITE_API_BASE_URL=http://localhost:8000`, `VITE_USE_MOCK=true`).

### Phase 0
- shadcn/ui set up (Radix, `components.json`, style `radix-vega`). Components added: `button`, `table`, `sheet`. `button` was simplified (4px radius, no shadow). `sheet` uses `shadow-dialog`.
- Router with six routes plus a not-found page: `/` Overview, `/review-budget`, `/commit-ranking`, `/check-a-commit`, `/models`, `/about`. Each page is a placeholder (`NotBuilt`) showing no data.
- Shared layout (`components/layout/AppLayout.tsx`): left sidebar from the `lg` breakpoint, top menu with a sheet below it, skip link, persistent evaluation-context strip.
- Evaluation-context strip: reads **only** `GET /evaluation-context`. Separately labelled fields: Split name, Date range, Commits, Buggy commits, Model version. No separators between fields; no hard-coded dates. Has loading and error states.
- `Notice` (one component, variants `sample`, `provisional`, `retrospective`; never dismissible).
- `DataTable` (one generic, controlled table: optional sort, optional pagination, required caption, square corners, tabular numerals for numeric columns).
- `ErrorState` (shows the API's own message, error code, HTTP status, and a "Try again" action; no retry button for configuration errors).
- `useApi` hook: the only place that chooses between fixtures and the API.
  - `VITE_USE_MOCK=true`: returns the fixture passed in `mock` (flagged `isMock`). Never calls the API. If no fixture is supplied it returns an error, not an empty success.
  - Otherwise: calls the API. Failures become error states and are never replaced by fixtures.
  - If `VITE_API_BASE_URL` is unset in real mode: configuration error (`CONFIG_ERROR`), no silent default.
  - Whenever a fixture is on screen, the layout shows a non-dismissible "Sample data" notice (via `hooks/fixtureRegistry.ts`).
- Central client (`api/client.ts`): accepts `{error_code, message, detail}`, FastAPI `{detail: string}`, and the FastAPI 422 list form (turned into `field_errors`). The text shown is the API's own. The "cannot reach the API at ..." text appears only for network failures. Verified with a script against six error shapes.
- `api/types.ts`: rewritten to the approved proposed contract with one ASSUMPTIONS block at the top (A1 to A19). This was done during Phase 0 because the client, `useApi` and strip depend on `ApiError`, `AsyncState` and `EvaluationContext`. Phase 1 reviews it rather than creating it.

### Verified in Phase 0
- `pnpm build` passes (`tsc -b` and `vite build`). `pnpm lint` reports 0 warnings and 0 errors.
- Dev server run in three modes: mock mode on (sample notice and strip fixture visible), mock off with the API unreachable (network error with retry; no fixtures), mock off with no base URL (configuration error).
- Desktop (sidebar) and narrow (top menu, sheet) layouts both checked in the browser.

## What remains

| Phase | Status |
|---|---|
| 1 Types and mocks | Types done early (see above). To do: fixtures for each endpoint (project-a, project-b, round numbers), `src/content/featureDefinitions.ts` (every definition "To be confirmed"), review of `types.ts`. |
| 2 Review budget and capture curve | Not started. Highest priority. |
| 3 Overview | Not started. |
| 4 Commit ranking | Not started. |
| 5 Check a commit (includes global feature importance) | Not started. |
| 6 Models | Not started. |
| 7 About and limitations (short static page, P0) | Not started. |
| P1 (confusion matrix, CSV, extras) | Only after all P0 works and before the 14 Nov feature freeze. |

Also still to do:
- Provisional-model banner. Rule: if the model is provisional, show a visible "Provisional model" banner. The `Notice` variant exists, but nothing renders it yet. Wire it (from `model_status` on `/health`, `/predict` and `/metrics` entries) in Phase 1 or 2.
- Chart tokens: dash patterns per series, titles, axis labels and text alternatives (Phase 2).
- `NotBuilt` placeholder component: delete when all pages are built.

## Known issues

- The shadcn CLI generated a broken `src/lib/utils.ts` (`export { cn } from "cn"`, an unrelated npm package) and `from "cn"` imports in components. These were replaced by the standard `clsx` + `tailwind-merge` helper and `@/lib/utils` imports. **After every `pnpm dlx shadcn@latest add ...`, check for `from "cn"` and fix it.** Using `-o` (overwrite) regenerates the wrong import.
- The `shadcn` package and `tw-animate-css` are runtime dependencies because `index.css` imports `shadcn/tailwind.css` and `tw-animate-css` (needed by the Radix sheet animations).
- "Try again" on an API error just re-requests; it cannot fix a bad `.env`. Configuration errors therefore show a restart hint instead.
- No tests exist yet.
- The in-IDE browser tool's screenshot action can trigger stray clicks while a sheet is open. This is a tooling artefact, not an app bug.

## Decisions taken (by the project lead)

- Six routes: Overview, Review budget, Commit ranking, Check a commit, Models, About. Global feature importance lives on Check a commit. About is a short static page and is P0. Review budget is built first.
- Stack: React, Vite, TypeScript, Tailwind v4, shadcn/ui, Recharts, `@fontsource`, pnpm.
- Notice variants may use amber, light blue and slate, only inside `Notice`.
- Shadows only on the strip (`--cp-shadow-sm`) and dialogs (`--cp-shadow-md`).
- No silent API default. Mock mode only with `VITE_USE_MOCK=true`.
- `score_type` is a free string; only the exact value `"probability"` is shown as a probability, everything else is a "relative risk score".
- `risk_band` is optional and comes from the API; no band means show the score only.
- The `/predict` response has **no separate `probability` field** (the audit suggested keeping one; the approved contract uses `risk_score` plus `score_type`). It also has no `explanation` field.
- The "global, not causal" feature-importance copy is owned by the frontend, not the API.
- Feature definitions stay "To be confirmed" until the project lead verifies them against the ApacheJIT paper.

### Mismatches with the repository docs (the project lead will update the docs)

- Root `README.md` says "React + Vite + JavaScript"; the frontend is **TypeScript**.
- The docs do not mention **shadcn/ui**; the frontend uses it.
- `docs/FEATURE_REQUIREMENTS.md` lists six pages (Overview, Commit Analysis, Review Budget, Model Performance, Explainability, Historical Evaluation). The frontend uses Overview, Review budget, Commit ranking, Check a commit, Models, About. There is no separate Explainability page, and About (a model card) is P0 here but P2 in the docs.
- The illustrative `/predict` response in the docs contains `explanation` with `direction: increases_score` and a `probability` field. The frontend does not use either.
- `requirements.txt` (outside `frontend/`, not touched) lists `streamlit`. The project must not use Streamlit; the owner may want to remove it.

## Open questions for the backend owner

These do not block frontend work. Each is also an assumption in `src/api/types.ts`.

1. `/capture-curve`: the step size (`step_pct`), and confirmation that percent runs from 0 to 100.
2. Rounding policy for fractional review budgets (`rounding_policy` string in `/review-budget`).
3. Tie policy (`tie_policy` string in `/review-budget` and `/capture-curve`).
4. Random-baseline method (`random_method` string in `/capture-curve`): analytic or simulated, and seed or number of trials if simulated.
5. Exact error shape (`{error_code, message, detail}` or FastAPI's default `{detail}`), and the 422 form. Both are accepted today.
6. `/commits` pagination parameter names (`page`, `page_size`, `sort_by`, `sort_dir`, `project`), allowed `sort_by` values, whether pages are 1-based, and where the project filter options come from (`available_projects`).
7. CORS: which origin is allowed and which dev port the backend uses.
8. Per-project fields: what `/review-budget?view=per_project` and `/dataset-summary` (`per_project`) return beyond the fields in `types.ts`.
9. Whether `/evaluation-context` is acceptable as the single source for the persistent strip (the other responses may repeat it).
10. How the "selected model" is signalled in `/metrics` (`is_active`), and whether `model_status` is always present.
11. What `/predict` returns when the model is missing (assumed 503 with an error body) and the validation limits per feature.

## API assumptions

The full list is the ASSUMPTIONS block (A1 to A19) at the top of `src/api/types.ts`. The endpoints are **proposed, not confirmed**:

`GET /health`, `GET /evaluation-context`, `GET /dataset-summary`, `GET /metrics`, `GET /review-budget?view=pooled|per_project`, `GET /capture-curve`, `GET /commits`, `GET /feature-importance`, `POST /predict`.

Keep every API assumption and type in that file. Do not scatter them.

## Where mock data is used

- `src/mocks/evaluationContext.mock.ts` (`sample-split`, `sample-model-v0`, 1970 placeholder dates, 1,000 commits, 100 buggy commits). Used only by `EvaluationContextStrip` and only when `VITE_USE_MOCK=true`.
- No other fixtures exist yet. Fixture files must not import from `src/api/client.ts`. Fixtures use obviously fake names (project-a, project-b) and round numbers.

## Rules to keep in mind

- No hard-coded, invented or estimated metrics, predictions, charts or result text. Every displayed number comes from the API or a clearly labelled fixture.
- No silent fallback to fixtures when the API fails.
- "Historical outcome" for historical labels. Historical replay is not live GitHub analysis.
- Do not modify `backend/`, `src/`, `models/`, `data/`, `reports/` or any Python file (everything stays inside `frontend/`).
- Do not use Streamlit.
- Feature definitions exist only in `src/content/featureDefinitions.ts`; the Check a commit form shows only the twelve feature codes.
