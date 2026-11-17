// SAMPLE FIXTURES. See flags.ts. Round placeholder numbers only.
// project-b deliberately has no buggy commits, to exercise the N/A state.
import type {
  BudgetPct,
  BudgetResult,
  ProjectBudgetResult,
  RankingMethod,
  ReviewBudgetPerProjectResponse,
  ReviewBudgetPooledResponse,
} from '../api/types';
import { mockEvaluationContext } from './evaluationContext.mock';

const ROUNDING = 'Sample placeholder text: budget counts rounded to the nearest whole commit';
const TIES = 'Sample placeholder text: ties ordered by commit ID';

const BUDGETS: BudgetPct[] = [10, 20, 30];
const METHODS: RankingMethod[] = ['model', 'change_size', 'random'];

function pooled(): BudgetResult[] {
  const caught: Record<RankingMethod, number[]> = {
    model: [40, 60, 75],
    change_size: [20, 35, 50],
    random: [10, 20, 30],
  };
  return BUDGETS.flatMap((pct, i) =>
    METHODS.map((method) => ({
      budget_pct: pct,
      method,
      commits_reviewed: (1000 * pct) / 100,
      buggy_caught: caught[method][i],
      total_buggy: 100,
      eval_set_size: 1000,
      capture_rate: caught[method][i] / 100,
    })),
  );
}

function perProject(): ProjectBudgetResult[] {
  const caught: Record<RankingMethod, number[]> = {
    model: [30, 50, 70],
    change_size: [20, 30, 45],
    random: [10, 20, 30],
  };
  const projectA = BUDGETS.flatMap((pct, i) =>
    METHODS.map((method) => ({
      project: 'project-a',
      budget_pct: pct,
      method,
      commits_reviewed: (500 * pct) / 100,
      buggy_caught: caught[method][i],
      total_buggy: 100,
      eval_set_size: 500,
      capture_rate: caught[method][i] / 100,
    })),
  );
  const projectB = BUDGETS.flatMap((pct) =>
    METHODS.map((method) => ({
      project: 'project-b',
      budget_pct: pct,
      method,
      commits_reviewed: (500 * pct) / 100,
      buggy_caught: null,
      total_buggy: null,
      eval_set_size: 500,
      capture_rate: null,
    })),
  );
  return [...projectA, ...projectB];
}

export const mockReviewBudgetPooled = {
  view: 'pooled',
  results: pooled(),
  rounding_policy: ROUNDING,
  tie_policy: TIES,
  evaluation_context: mockEvaluationContext,
} satisfies ReviewBudgetPooledResponse;

export const mockReviewBudgetPerProject = {
  view: 'per_project',
  results: perProject(),
  rounding_policy: ROUNDING,
  tie_policy: TIES,
  evaluation_context: mockEvaluationContext,
} satisfies ReviewBudgetPerProjectResponse;
