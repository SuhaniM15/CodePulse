# CodePulse frontend handoff

Read this first. Last updated: after Phase 1 (fixtures, content) and Phases 2 and 3 (Review budget, capture curve, Overview).

## Status

| Phase | State |
|---|---|
| 0 Scaffold | Done and accepted |
| 1 Types, mocks, content | Done (needs review) |
| 2 Review budget and capture curve | Done (needs review) |
| 3 Overview | Done (needs review) |
| 4 Commit ranking | Not started (page is a placeholder) |
| 5 Check a commit (+ global feature importance) | Not started |
| 6 Models | Not started |
| 7 About and limitations | Not started |
| P1 | Only after P0 works, before the 14 Nov feature freeze |

Git: all work is local and uncommitted on `main`. The project lead commits. Agents never commit, push or branch.

## Run

See [README.md](./README.md). `pnpm install`, copy `.env.example` to `.env`, `pnpm dev`. Also `pnpm build`, `pnpm lint`. pnpm only; keep the lockfile.

## What exists

- Shell: sidebar and top menu, evaluation-context strip (reads `/evaluation-context`, plus `/health` for the Provisional notice), `Notice`, `DataTable`, `ErrorState`, `EmptyState`, `LoadingState`, `AsyncView` (loading, API error with 422 field errors, empty, success), `SegmentedControl`, `FieldList`, `ProvisionalNotice`.
- `useApi` is the only mock/real switch. Mock mode shows the "Sample data" notice automatically. No fallback to fixtures on API errors.
- Fixtures: `src/mocks/*.mock.ts`, one per endpoint (health, dataset summary, metrics, review budget pooled and per-project, capture curve, commits, feature importance, predict) plus `evaluationContext.mock.ts`. Fake names (project-a, project-b), round numbers. project-b has no buggy commits to exercise N/A. `flags.ts` reads `VITE_MOCK_PROVISIONAL`.
- `src/content/featureDefinitions.ts`: 12 codes, every definition "To be confirmed".
- Review budget page: 10/20/30 control, pooled/per-project toggle, grouped bars (solid, hatch, dots), results table, rounding and tie policy from the API, N/A explanation, retrospective notice, text alternative.
- Capture curve (`components/charts/CaptureCurveChart.tsx`): three dashed/solid lines, accessible description, data table in a details element, `random_method` and `tie_policy` shown from the API, one draw-in animation (off under reduced motion). Shows an empty state if any of the three series is missing.
- Overview: intro, retrospective notice, hero (headline sentence + curve), intended use, separate Full dataset and Evaluation split sections, selected model summary.
- Headline = pooled `/review-budget`, 20% budget, CodePulse vs random, built only from `buggy_caught`, `total_buggy`, `capture_rate`. Any missing value gives a described empty state.

## Known issues

- Not yet checked in a browser or with a real API (this round: build and lint only).
- Review budget chart uses Recharts `Cell` to dim unselected budgets in the pooled view; Recharts may deprecate it.
- Provisional notice appears in the strip and on Overview and Review budget. Commit ranking, Check a commit and Models must add `ProvisionalNotice` when built.
- No tests.
- shadcn CLI writes `from "cn"` imports and a wrong `lib/utils.ts`. After every `shadcn add`, grep for `from "cn"` and fix.
- `NotBuilt` placeholder component: delete when all pages are built.

## Decisions (project lead)

- Routes: Overview, Review budget, Commit ranking, Check a commit, Models, About. Feature importance lives on Check a commit. About is a short static P0 page.
- `score_type` is a free string; only `"probability"` is shown as probability. `risk_band` optional, from the API only. No `probability` or `explanation` field on `/predict`.
- "Global, not causal" copy is owned by the frontend.
- Notice colours only inside `Notice`. Shadows only on the strip and dialogs.
- Docs mismatches (the lead will update): README says JavaScript (frontend is TypeScript); docs omit shadcn/ui; page names differ from `FEATURE_REQUIREMENTS.md` (no separate Explainability page; About is P0 here). The docs' example `/predict` response has `explanation` and `probability`, which are not used. `requirements.txt` lists Streamlit, which must not be used.

## API assumptions

All in the ASSUMPTIONS block (A1 to A21) at the top of `src/api/types.ts`. Endpoints are proposed, not confirmed: `/health`, `/evaluation-context`, `/dataset-summary`, `/metrics`, `/review-budget?view=`, `/capture-curve`, `/commits`, `/feature-importance`, `POST /predict`. New this round: A20 (provisional banner reads `/health`), A21 (rates are fractions 0 to 1, curve points are percent 0 to 100).

## Open questions for the backend owner

1. Capture-curve step size and units. 2. Rounding policy. 3. Tie policy. 4. Random-baseline method. 5. Exact error shape. 6. `/commits` parameter names and sort fields. 7. CORS origin and dev port. 8. Per-project fields. 9. Is `capture_rate` a fraction (0 to 1), as assumed in A21? 10. Does `/review-budget` pooled include `eval_set_size` and `total_buggy` on every row?

## Mock data in use

Every `src/mocks/*.mock.ts` file, only when `VITE_USE_MOCK=true`. Used by: strip (`evaluation-context`, `health`), Overview (`review-budget`, `capture-curve`, `dataset-summary`, `evaluation-context`, `metrics`), Review budget. `commits`, `feature-importance` and `predict` fixtures exist but nothing uses them yet.
