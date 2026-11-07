// SAMPLE FIXTURE. See flags.ts. Magnitudes only; placeholder numbers.
import type { FeatureImportanceResponse } from '../api/types';
import { MOCK_MODEL_VERSION } from './flags';

export const mockFeatureImportance = {
  features: [
    { feature: 'la', importance: 0.3 },
    { feature: 'ld', importance: 0.1 },
    { feature: 'nf', importance: 0.1 },
    { feature: 'nd', importance: 0.05 },
    { feature: 'ns', importance: 0.05 },
    { feature: 'ent', importance: 0.1 },
    { feature: 'ndev', importance: 0.05 },
    { feature: 'age', importance: 0.05 },
    { feature: 'nuc', importance: 0.05 },
    { feature: 'aexp', importance: 0.05 },
    { feature: 'arexp', importance: 0.05 },
    { feature: 'asexp', importance: 0.05 },
  ],
  method: 'Sample placeholder method',
  model_version: MOCK_MODEL_VERSION,
} satisfies FeatureImportanceResponse;
