// ─────────────────────────────────────────────────────────────────────────────
// CodePulse: central API type definitions (PROPOSED contract, not confirmed)
//
// This file is the single source of truth for API types and for every API
// assumption. Mock fixtures and endpoint code must conform to these types.
// Anything not listed here has not been agreed with the backend owner.
//
// ASSUMPTIONS (each needs confirmation from the backend owner)
//
//  General
//  A1.  Base URL comes from VITE_API_BASE_URL. There is no silent default.
//  A2.  Errors are returned as { error_code, message, detail? }, or as
//       FastAPI's default { detail: string }, or as FastAPI's 422 list form
//       { detail: [{ loc, msg, type }] }. The UI shows the API's own text.
//  A3.  CORS allows the Vite dev origin, and the dev port is known. OPEN.
//
//  GET /health
//  A4.  Returns status, model_loaded, model_version and model_status.
//
//  GET /evaluation-context
//  A5.  Single source for the persistent evaluation-context strip. Other
//       responses may repeat it as `evaluation_context`, but the strip reads
//       this endpoint only. Date ranges always come from the API.
//
//  GET /dataset-summary
//  A6.  Full dataset only (not the evaluation split): total commits, buggy
//       commits, buggy rate (0 to 1), project list, and optional per-project
//       counts. Kept separate from EvaluationContext.
//
//  GET /metrics
//  A7.  Returns models, evaluation_context and calibration_available.
//       `is_active` marks the selected model. `model_status` is on each entry.
//       `threshold_method` is free text. `brier` is optional.
//
//  GET /review-budget?view=pooled|per_project
//  A8.  Response carries rounding_policy and tie_policy as strings, which the
//       UI displays. Budget percentages are 10, 20 and 30.
//  A9.  A project with no positive examples returns null for buggy_caught,
//       total_buggy and capture_rate. The UI shows N/A with its own explanation.
//
//  GET /capture-curve
//  A10. Points are in percent (0 to 100) at a fixed step reported as `step_pct`.
//       Series are model, change_size and random, all evaluated on the same
//       evaluation set. The response includes random_method and tie_policy
//       strings, which the UI displays.
//
//  GET /commits
//  A11. Query: page (1-based), page_size, sort_by, sort_dir, project.
//       Outcome values are "buggy" | "clean"; the UI label is "Historical
//       outcome". `sort_by` allowed values are listed in CommitSortField.
//  A12. Project filter options come from `available_projects` in the response.
//       Per-project fields beyond the ones below are an open question.
//
//  GET /feature-importance
//  A13. Global, magnitude only: method, model_version and entries of
//       { feature, importance }. No direction field. The "global, not causal"
//       copy is owned by the frontend, not by the API.
//
//  POST /predict
//  A14. Accepts exactly the 12 feature codes in FEATURE_CODES.
//  A15. Validation errors return 422. A missing model returns 503 with an
//       error body.
//  A16. `risk_score` is the single score value. `score_type` is a free string:
//       the UI says "probability" only when it equals "probability", otherwise
//       it says "relative risk score". There is no separate probability field.
//  A17. `risk_band` is optional and computed by the server (thresholds live
//       there). When absent or null the UI shows the score only. The frontend
//       never infers a band.
//  A18. There is no local explanation field.
//
//  Model status
//  A19. `model_status` ("provisional" | "final") is present on /health,
//       /predict and each /metrics entry. "Provisional" shows a banner.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared / meta ─────────────────────────────────────────────────────────────

export type ModelStatus = 'provisional' | 'final';

/** A16: free string. Only the exact value "probability" means probability. */
export type ScoreType = string;

export type RiskBand = 'low' | 'medium' | 'high';
export type SortDir = 'asc' | 'desc';
export type ViewMode = 'pooled' | 'per_project';
export type BudgetPct = 10 | 20 | 30;
export type RankingMethod = 'model' | 'change_size' | 'random';

/** The twelve backend-approved feature codes (A14). Definitions live only in
 *  src/content/featureDefinitions.ts. */
export const FEATURE_CODES = [
  'la',
  'ld',
  'nf',
  'nd',
  'ns',
  'ent',
  'ndev',
  'age',
  'nuc',
  'aexp',
  'arexp',
  'asexp',
] as const;

export type FeatureCode = (typeof FEATURE_CODES)[number];

// ── Health (GET /health) ──────────────────────────────────────────────────────

export interface HealthResponse {
  status: string; // e.g. "ok"
  model_loaded: boolean;
  model_version: string | null;
  model_status: ModelStatus | null;
}

// ── Dataset summary (GET /dataset-summary): FULL dataset, not split-scoped ───
// No date range here. Date ranges belong to EvaluationContext only (A5, A6).

export interface DatasetProjectCount {
  project: string;
  total_commits: number;
  buggy_commits: number;
}

export interface DatasetSummary {
  total_commits: number;
  buggy_commits: number;
  buggy_rate: number; // 0 to 1
  projects: string[];
  per_project?: DatasetProjectCount[];
}

// ── Evaluation context (GET /evaluation-context): evaluation split only ──────
// date_range values come from the API and are never hard-coded in the frontend.

export interface EvaluationContext {
  split_name: string;
  split_type?: string;
  date_range: {
    start: string; // ISO 8601 date
    end: string; // ISO 8601 date
  };
  total_commits: number;
  buggy_commits: number;
  model_version: string | null;
}

// ── Capture curve (GET /capture-curve) ────────────────────────────────────────
// Used by the Overview hero. /review-budget serves the 10/20/30% results.

export interface CurvePoint {
  pct_reviewed: number; // 0 to 100
  pct_caught: number; // 0 to 100
}

export interface CurveSeries {
  method: RankingMethod;
  points: CurvePoint[];
}

export interface CaptureCurveResponse {
  step_pct: number; // fixed step between points, in percent
  series: CurveSeries[];
  random_method: string;
  tie_policy: string;
  evaluation_context?: EvaluationContext;
}

// ── Model metrics (GET /metrics) ──────────────────────────────────────────────

export interface ModelMetricsEntry {
  model_id: string;
  model_name: string;
  pr_auc: number | null;
  roc_auc: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  mcc: number | null;
  brier?: number | null; // optional
  threshold: number | null;
  threshold_method: string | null; // free text
  is_active: boolean; // marks the selected model
  model_status: ModelStatus;
}

export interface ModelMetricsResponse {
  models: ModelMetricsEntry[];
  evaluation_context: EvaluationContext;
  calibration_available: boolean;
}

// ── Review budget (GET /review-budget) ────────────────────────────────────────

export interface BudgetResult {
  budget_pct: BudgetPct;
  method: RankingMethod;
  commits_reviewed: number;
  buggy_caught: number | null; // null when there are no positive examples (A9)
  total_buggy: number | null; // null when there are no positive examples (A9)
  eval_set_size: number;
  capture_rate: number | null; // null when there are no positive examples (A9)
}

export interface ProjectBudgetResult extends BudgetResult {
  project: string;
}

interface ReviewBudgetBase {
  rounding_policy: string;
  tie_policy: string;
  evaluation_context?: EvaluationContext;
}

export interface ReviewBudgetPooledResponse extends ReviewBudgetBase {
  view: 'pooled';
  results: BudgetResult[];
}

export interface ReviewBudgetPerProjectResponse extends ReviewBudgetBase {
  view: 'per_project';
  results: ProjectBudgetResult[];
}

export type ReviewBudgetResponse =
  | ReviewBudgetPooledResponse
  | ReviewBudgetPerProjectResponse;

// ── Historical commits (GET /commits) ─────────────────────────────────────────

export type HistoricalOutcome = 'buggy' | 'clean';

export type CommitSortField = 'risk_score' | 'commit_id' | 'project' | 'outcome';

export interface CommitsQuery {
  page: number; // 1-based
  page_size: number;
  sort_by: CommitSortField;
  sort_dir: SortDir;
  project?: string;
}

export interface HistoricalCommit {
  commit_id: string;
  project: string;
  risk_score: number;
  score_type: ScoreType;
  risk_band?: RiskBand | null; // optional; shown only when supplied
  outcome: HistoricalOutcome; // UI label: "Historical outcome"
  model_version: string;
}

export interface CommitsResponse {
  commits: HistoricalCommit[];
  total: number;
  page: number;
  page_size: number;
  available_projects?: string[];
  evaluation_context?: EvaluationContext;
}

// ── Feature importance (GET /feature-importance) ──────────────────────────────
// Global, magnitude only. No direction field, by design (A13).

export interface FeatureImportanceEntry {
  feature: FeatureCode;
  importance: number; // magnitude
}

export interface FeatureImportanceResponse {
  features: FeatureImportanceEntry[];
  method: string;
  model_version: string;
}

// ── Prediction (POST /predict) ────────────────────────────────────────────────
// No explanation field (A18). No client-side risk-band inference (A17).

export type PredictRequest = Record<FeatureCode, number>;

export interface PredictResponse {
  model_status: ModelStatus;
  score_type: ScoreType;
  risk_score: number;
  risk_band?: RiskBand | null; // absent or null means show the score only
  notice?: string;
  model_version: string;
}

// ── API error ─────────────────────────────────────────────────────────────────
// The frontend shows `message` directly (A2).

export interface ApiFieldError {
  field: string; // e.g. a feature code, taken from the last segment of `loc`
  message: string;
}

export interface ApiError {
  error_code: string;
  message: string;
  detail?: string;
  field_errors?: ApiFieldError[]; // from FastAPI 422 responses
  status: number; // 0 for network and configuration failures
}

// ── Generic async UI state ────────────────────────────────────────────────────
// isMock is true only when data came from a fixture because VITE_USE_MOCK=true.
// An API error is never silently swapped for mock data.

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T; isMock: boolean }
  | { status: 'error'; error: ApiError };
