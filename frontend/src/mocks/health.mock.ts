// SAMPLE FIXTURE. See flags.ts.
import type { HealthResponse } from '../api/types';
import { MOCK_MODEL_STATUS, MOCK_MODEL_VERSION } from './flags';

export const mockHealth = {
  status: 'ok',
  model_loaded: true,
  model_version: MOCK_MODEL_VERSION,
  model_status: MOCK_MODEL_STATUS,
} satisfies HealthResponse;
