// SAMPLE FIXTURE. See flags.ts. Fake commit IDs; not real commits.
import type { CommitsResponse, HistoricalCommit } from '../api/types';
import { mockEvaluationContext } from './evaluationContext.mock';
import { MOCK_MODEL_VERSION } from './flags';

const rows: Array<[string, string, number, 'buggy' | 'clean', 'low' | 'medium' | 'high' | null]> = [
  ['sample-0001', 'project-a', 0.9, 'buggy', 'high'],
  ['sample-0002', 'project-a', 0.8, 'buggy', 'high'],
  ['sample-0003', 'project-b', 0.7, 'clean', 'medium'],
  ['sample-0004', 'project-a', 0.6, 'clean', 'medium'],
  ['sample-0005', 'project-b', 0.5, 'clean', null],
  ['sample-0006', 'project-a', 0.4, 'buggy', null],
  ['sample-0007', 'project-b', 0.3, 'clean', 'low'],
  ['sample-0008', 'project-b', 0.2, 'clean', 'low'],
];

const commits: HistoricalCommit[] = rows.map(
  ([commit_id, project, risk_score, outcome, risk_band]) => ({
    commit_id,
    project,
    risk_score,
    score_type: 'relative_risk_score',
    risk_band,
    outcome,
    model_version: MOCK_MODEL_VERSION,
  }),
);

export const mockCommits = {
  commits,
  total: commits.length,
  page: 1,
  page_size: 10,
  available_projects: ['project-a', 'project-b'],
  evaluation_context: mockEvaluationContext,
} satisfies CommitsResponse;
