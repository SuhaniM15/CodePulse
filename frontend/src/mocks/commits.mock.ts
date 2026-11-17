// SAMPLE FIXTURE. See flags.ts. Fake commit IDs; not real commits.
// mockCommitsFor imitates the proposed server behaviour (filter, sort,
// paginate) so the Commit ranking page can be exercised in mock mode only.
import type { CommitsQuery, CommitsResponse, HistoricalCommit, RiskBand } from '../api/types';
import { mockEvaluationContext } from './evaluationContext.mock';
import { MOCK_MODEL_VERSION } from './flags';

// The frontend has no band thresholds: real bands and their cut-offs come from
// the API (types.ts A17). These cut-offs exist only so the sample rows are
// self-consistent (a higher score never gets a lower band). They are sample
// placeholders, not a proposal for the real thresholds.
function sampleBand(score: number): RiskBand {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

const ALL: HistoricalCommit[] = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1;
  const risk_score = ((n * 7) % 10 + 1) / 10;
  return {
    commit_id: `sample-${String(n).padStart(4, '0')}`,
    project: n % 3 === 0 ? 'project-b' : 'project-a',
    risk_score,
    score_type: 'relative_risk_score',
    // Every fourth row has no band, to exercise the "score only" case.
    risk_band: n % 4 === 3 ? null : sampleBand(risk_score),
    outcome: n % 5 === 0 ? 'buggy' : 'clean',
    model_version: MOCK_MODEL_VERSION,
  };
});

export function mockCommitsFor(query: CommitsQuery): CommitsResponse {
  const filtered = query.project ? ALL.filter((c) => c.project === query.project) : ALL;
  const dir = query.sort_dir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    const av = a[query.sort_by];
    const bv = b[query.sort_by];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return cmp * dir || a.commit_id.localeCompare(b.commit_id);
  });
  const start = (query.page - 1) * query.page_size;
  return {
    commits: sorted.slice(start, start + query.page_size),
    total: sorted.length,
    page: query.page,
    page_size: query.page_size,
    available_projects: ['project-a', 'project-b'],
    evaluation_context: mockEvaluationContext,
  };
}
