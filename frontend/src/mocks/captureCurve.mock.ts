// SAMPLE FIXTURE. See flags.ts. Round placeholder numbers; consistent with
// reviewBudget.mock.ts at the 10, 20 and 30 percent points.
import type { CaptureCurveResponse, CurvePoint } from '../api/types';
import { mockEvaluationContext } from './evaluationContext.mock';

function toPoints(caught: number[]): CurvePoint[] {
  return caught.map((pct_caught, i) => ({ pct_reviewed: i * 10, pct_caught }));
}

export const mockCaptureCurve = {
  step_pct: 10,
  series: [
    { method: 'model', points: toPoints([0, 40, 60, 75, 80, 85, 90, 95, 100, 100, 100]) },
    { method: 'change_size', points: toPoints([0, 20, 35, 50, 60, 70, 80, 85, 90, 95, 100]) },
    { method: 'random', points: toPoints([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) },
  ],
  random_method: 'Sample placeholder text: expected value of a random ordering',
  tie_policy: 'Sample placeholder text: ties ordered by commit ID',
  evaluation_context: mockEvaluationContext,
} satisfies CaptureCurveResponse;
