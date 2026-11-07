// ─────────────────────────────────────────────────────────────────────────────
// CodePulse — central API type definitions
// Single source of truth. All mock data and endpoint functions must conform
// to these types. Any change here propagates to the whole frontend.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared / meta ─────────────────────────────────────────────────────────────

export type ModelStatus   = 'provisional' | 'final';
export type ScoreType     = 'relative_risk_score' | 'probability';
export type RiskBand      = 'low' | 'medium' | 'high';
export type SortDir       = 'asc' | 'desc';
export type ViewMode      = 'pooled' | 'per_project';
export type BudgetPct     = 10 | 20 | 30;
export type RankingMethod = 'model' | 'random' | 'change_size';
export type NoticeVariant = 'sample' | 'provisional' | 'retrospective';

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'ok' | 'degraded';
  model_loaded: boolean;
  model_version: string | null;
  model_status: ModelStatus | null;
}

// ── Dataset summary (full dataset — not split-scoped) ─────────────────────────
// Returned by GET /dataset-summary
// Does NOT include date_range — date ranges belong to EvaluationContext only.

export interface DatasetSummary {
  total_commits: number;
  buggy_commits: number;
  buggy_rate: number;     // 0–1
  projects: string[];
}

// ── Evaluation context (evaluation-split-scoped) ──────────────────────────────
// Embedded in responses from /capture-curve, /metrics, /review-budget, /commits.
// date_range values come from the API; never hard-coded in frontend code.

export interface EvaluationContext {
  split_name: string;
  split_type: string;
  date_range: {
    start: string;        // ISO 8601 date string
    end: string;          // ISO 8601 date string
  };
  total_commits: number;
  buggy_commits: number;
  model_version: string | null;
}

// ── Capture curve (GET /capture-curve) ───────────────────────────────────────
// Used by the Overview hero chart only.
// /review-budget remains responsible for the 10/20/30% summary results.

export interface CurvePoint {
  pct_reviewed: number;   // 0–100
  pct_caught: number;     // 0–100
}

export interface CurveSeries {
  method: RankingMethod;
  points: CurvePoint[];
}

export interface CaptureCurveResponse {
  series: CurveSeries[];
  evaluation_context: EvaluationContext;
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
  brier?: number | null;    // present only when calibration data is available
  threshold: number | null;
  threshold_method: string | null;
  is_active: boolean;
  model_status: ModelStatus;
}

export interface ModelMetricsResponse {
  models: ModelMetricsEntry[];
  evaluation_context: EvaluationContext;
  calibration_available: boolean;
}

// ── Review budget (GET /review-budget) ───────────────────────────────────────

export interface BudgetResult {
  budget_pct: BudgetPct;
  method: RankingMethod;
  commits_reviewed: number;
  buggy_caught: number | null;    // null when project has no positive labels
  total_buggy: number | null;     // null when project has no positive labels
  eval_set_size: number;
  capture_rate: number | null;    // null when project has no positive labels
}

export interface ProjectBudgetResult extends BudgetResult {
  project: string;
}

export interface ReviewBudgetResponse {
  view: ViewMode;
  results?: BudgetResult[];           // present when view === 'pooled'
  projects?: ProjectBudgetResult[];   // present when view === 'per_project'
  evaluation_context: EvaluationContext;
}

// ── Historical commits (GET /commits) ─────────────────────────────────────────

export interface HistoricalCommit {
  commit_id: string;
  project: string;
  risk_score: number;
  outcome: 'buggy' | 'clean';
  model_version: string;
  score_type: ScoreType;
}

export interface CommitsResponse {
  commits: HistoricalCommit[];
  total: number;
  page: number;
  page_size: number;
}

// ── Feature importance (GET /feature-importance) ─────────────────────────────
// Global magnitude only. Direction field deliberately absent.
// Association is not causation.

export interface FeatureImportanceEntry {
  feature: string;
  importance: number;
}

export interface FeatureImportanceResponse {
  features: FeatureImportanceEntry[];
  method: string;           // e.g. 'permutation_importance', 'shap', 'coefficients'
  model_version: string;
  notice: string;           // must state global / not causal
}

// ── Prediction (POST /predict) ────────────────────────────────────────────────
// risk_band comes from the API. If null or absent, the UI shows the score only.
// No client-side band inference.
// explanation field absent — not included unless backend documents local explanations.

export interface PredictRequest {
  la: number;
  ld: number;
  nf: number;
  nd: number;
  ns: number;
  ent: number;
  ndev: number;
  age: number;
  nuc: number;
  aexp: number;
  arexp: number;
  asexp: number;
}

export interface PredictResponse {
  model_status: ModelStatus;
  score_type: ScoreType;
  risk_score: number;
  risk_band: RiskBand | null;   // null = API did not return it; show score only
  probability: number | null;   // non-null only when score_type === 'probability'
  notice: string;
  model_version: string;
}

// ── API error ─────────────────────────────────────────────────────────────────
// The frontend shows error.message directly. Never show generic apology text.

export interface ApiError {
  error_code: string;
  message: string;
  detail?: string;
  status: number;
}

// ── Generic async UI state ────────────────────────────────────────────────────
// isMock: true when data came from mock fixtures, not from the real API.
// An API error with VITE_USE_MOCK=false is never silently swapped for mock data.

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; isMock: boolean }
  | { status: 'error'; error: ApiError };
