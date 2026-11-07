// ─────────────────────────────────────────────────────────────────────────────
// Mock data index
//
// isMockMode() is the single gate. Pages must NOT decide individually whether
// to use mocks. Only the useApi hook reads this flag.
//
// All mock values use project-a / project-b and round placeholder numbers.
// They are NOT intended to look like real project results.
// ─────────────────────────────────────────────────────────────────────────────

export { isMockMode } from '../api/client';

export { mockHealth } from './health.mock';
export { mockDatasetSummary } from './datasetSummary.mock';
export { mockCaptureCurve } from './captureCurve.mock';
export { mockModelMetrics } from './modelMetrics.mock';
export { mockReviewBudgetPooled, mockReviewBudgetPerProject } from './reviewBudget.mock';
export { mockCommits } from './commits.mock';
export { mockFeatureImportance } from './featureImportance.mock';
export { mockPredictResponse } from './predict.mock';
