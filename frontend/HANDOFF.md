# CodePulse frontend handoff

Read this first. Last updated: after Phase C (Commit ranking, Check a commit, Models, About). All six routes are now built.

## Status

| Phase | State |
|---|---|
| 0 Scaffold | Done, accepted |
| 1 Types, mocks, content | Done |
| 2 Review budget and capture curve | Done |
| 3 Overview | Done |
| C: Commit ranking, Check a commit, Models, About | Done (needs review; build and lint only, not run in a browser) |
| Next | Backend integration and polish (Phase D), then optional P1 before the 14 Nov feature freeze |

Git: all work is local and uncommitted on `main`. The project lead commits. Agents never commit, push or branch.

## Run

See [README.md](./README.md). `pnpm install`, copy `.env.example` to `.env`, `pnpm dev`. Also `pnpm build`, `pnpm lint`. pnpm only; keep the lockfile.

## What exists

- Shared: `Notice` (sample, provisional, retrospective), `ProvisionalNotice`, `DataTable` (controlled sort and pagination), `AsyncView` (loading, API error with 422 field errors, empty), `ErrorState`, `EmptyState`, `FieldList`, `SegmentedControl`, `RiskChip` (text label always; render only when the API gives a band), `useApi` (only mock/real switch for GET), `usePredict` (same rules for POST), `useHealth`.
- Review budget, Overview, capture curve: as in the previous handoff (unchanged).
- Commit ranking: server-side sort (`commit_id`, `project`, `risk_score`, `outcome`) and pagination (page size 10, constant in the page), project filter from `/dataset-summary`, retrospective and provisional notices. Score header says "Relative risk score" unless every row's `score_type` is `"probability"`. Mock mode filters, sorts and paginates 30 fake rows in `mocks/commits.mock.ts` (`mockCommitsFor`), mock mode only.
- Check a commit: exactly the 12 feature codes as labels; helper text comes only from `featureDefinitions.ts` ("To be confirmed"). Required, numeric and non-negative validation. API 422 `field_errors` appear beside the matching field until that field is edited; other errors (503 and so on) show the API's own message with "Try again". Result shows the score labelled by `score_type`, `risk_band` only if returned, "This is an estimate" wording, the API `notice`, and the provisional notice (from the response, else `/health`). A response without a numeric `risk_score` is an error, never a score. Global feature importance sits below with the required sentence, the method name, model version, magnitudes only (chart plus table).
- Models: comparison table (PR-AUC, ROC-AUC, precision, recall, F1, MCC, Brier column only if any model reports it, threshold, threshold-selection text), "Active model" tag, evaluation split from the API context, N/A for nulls, retrospective and provisional notices. Calibration section: shows the "relative risk scores unless calibration is validated" explanation when `calibration_available` is not true; when true it says so but draws no plot (no calibration data contract exists).
- About: static page covering intended use, not a merge gate, Apache Java projects 2003–2019, other teams need retraining, noisy labels, scores are not probabilities, limitations, references placeholder.

## Known issues

- Not run in a browser or against a real API since Phase B; only build and lint.
- `src/components/NotBuilt.tsx` is unused. Delete it (needs the lead's permission).
- No calibration plot (no data contract). No tests.
- Commit ranking page size is a UI constant (10); the real API may prefer another.
- Review budget pooled chart uses Recharts `Cell` for dimming; may be deprecated.
- shadcn CLI writes `from "cn"` imports and a wrong `lib/utils.ts`. After every `shadcn add`, grep for `from "cn"`. (No `add` was run in Phase C.)

## Decisions (project lead)

- Routes: Overview, Review budget, Commit ranking, Check a commit, Models, About. Feature importance lives on Check a commit.
- `score_type` is a free string; only `"probability"` is shown as a probability. `risk_band` optional, from the API only. No `probability` or `explanation` field on `/predict`.
- Evaluation date range goes through `formatDateRange` (`lib/format.ts`): a missing, non-ISO, zero or reversed range shows "Not available". The 1970 dates in the fixture are a deliberate placeholder.
- The frontend has no risk-band thresholds. Fixture bands in `commits.mock.ts` follow the score using sample-only cut-offs (0.7 high, 0.4 medium); real cut-offs come from the API.
- "Global importance across the evaluation data, not the cause of risk in this commit" is frontend-owned copy.
- Notice colours only inside `Notice`. Shadows only on the strip and dialogs.
- Docs mismatches (the lead will update): README says JavaScript (frontend is TypeScript); docs omit shadcn/ui; page names differ from `FEATURE_REQUIREMENTS.md`; the docs' example `/predict` response has `explanation` and `probability`, which are not used. `requirements.txt` lists Streamlit, which must not be used.

## API assumptions

All in the ASSUMPTIONS block (A1 to A21) at the top of `src/api/types.ts`. Endpoints are proposed, not confirmed: `/health`, `/evaluation-context`, `/dataset-summary`, `/metrics`, `/review-budget?view=`, `/capture-curve`, `/commits`, `/feature-importance`, `POST /predict`.

## Open questions for the backend owner

1. Capture-curve step size and units. 2. Rounding policy. 3. Tie policy. 4. Random-baseline method. 5. Exact error shape (including 503 body for a missing model). 6. `/commits`: parameter names, allowed `sort_by` values, 1-based pages, default page size, and whether `outcome` values are exactly `buggy` and `clean`. 7. CORS origin and dev port. 8. Per-project fields. 9. Is `capture_rate` a fraction (0 to 1)? 10. Does pooled `/review-budget` include `eval_set_size` and `total_buggy` on every row? 11. Calibration: what data will a calibration plot use when `calibration_available` is true? 12. Does `/predict` need any range limits beyond non-negative numbers? 13. Is `risk_score` always on the same scale as the `/commits` scores?

## Mock data in use

Every `src/mocks/*.mock.ts` file, only when `VITE_USE_MOCK=true`. Used by: strip (`evaluation-context`, `health`), Overview, Review budget, Commit ranking (`commits`, `dataset-summary`), Check a commit (`predict`, `feature-importance`), Models (`metrics`). About uses none.
