// SAMPLE FIXTURES ONLY. Placeholder values; never real projects, results or dates.
// Fixtures appear only when VITE_USE_MOCK=true, always with the "Sample data" notice.
// Fixture files must not import from src/api/client.ts.

import type { ModelStatus } from '../api/types';

/** VITE_MOCK_PROVISIONAL=true makes every fixture report a provisional model. */
export const MOCK_MODEL_STATUS: ModelStatus =
  import.meta.env.VITE_MOCK_PROVISIONAL === 'true' ? 'provisional' : 'final';

export const MOCK_MODEL_VERSION = 'sample-model-v0';
