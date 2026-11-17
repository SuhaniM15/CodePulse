// SAMPLE FIXTURE. See flags.ts. Placeholder score; risk_band is deliberately
// absent so the "score only" behaviour is exercised.
import type { PredictResponse } from '../api/types';
import { MOCK_MODEL_STATUS, MOCK_MODEL_VERSION } from './flags';

export const mockPredictResponse = {
  model_status: MOCK_MODEL_STATUS,
  score_type: 'relative_risk_score',
  risk_score: 0.5,
  risk_band: null,
  notice: 'Sample placeholder text. This is not a real prediction.',
  model_version: MOCK_MODEL_VERSION,
} satisfies PredictResponse;
