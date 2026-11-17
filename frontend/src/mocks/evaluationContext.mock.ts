// SAMPLE FIXTURE. Placeholder values only; not real results, projects or dates.
// Shown only when VITE_USE_MOCK=true, always together with the "Sample data" notice.
// This file must not import from src/api/client.ts.

import type { EvaluationContext } from '../api/types';

export const mockEvaluationContext = {
  split_name: 'sample-split',
  split_type: 'sample',
  date_range: { start: '1970-01-01', end: '1970-12-31' },
  total_commits: 1000,
  buggy_commits: 100,
  model_version: 'sample-model-v0',
} satisfies EvaluationContext;
