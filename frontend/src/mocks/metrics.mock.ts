// SAMPLE FIXTURE. See flags.ts.
import type { ModelMetricsResponse } from '../api/types';
import { mockEvaluationContext } from './evaluationContext.mock';
import { MOCK_MODEL_STATUS } from './flags';

export const mockModelMetrics = {
  models: [
    {
      model_id: 'sample-model-a',
      model_name: 'Sample model A',
      pr_auc: 0.5,
      roc_auc: 0.7,
      precision: 0.5,
      recall: 0.5,
      f1: 0.5,
      mcc: 0.3,
      threshold: 0.5,
      threshold_method: 'Sample placeholder text; not a real selection method',
      is_active: true,
      model_status: MOCK_MODEL_STATUS,
    },
    {
      model_id: 'sample-model-b',
      model_name: 'Sample model B',
      pr_auc: 0.4,
      roc_auc: 0.6,
      precision: 0.4,
      recall: 0.6,
      f1: 0.5,
      mcc: 0.2,
      brier: 0.2,
      threshold: 0.4,
      threshold_method: 'Sample placeholder text; not a real selection method',
      is_active: false,
      model_status: MOCK_MODEL_STATUS,
    },
    {
      model_id: 'sample-baseline',
      model_name: 'Sample baseline',
      pr_auc: 0.3,
      roc_auc: 0.5,
      precision: null,
      recall: null,
      f1: null,
      mcc: null,
      threshold: null,
      threshold_method: null,
      is_active: false,
      model_status: MOCK_MODEL_STATUS,
    },
  ],
  evaluation_context: mockEvaluationContext,
  calibration_available: false,
} satisfies ModelMetricsResponse;
