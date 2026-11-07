import { useId, useMemo, useState } from 'react';

import { isMockMode } from '@/api/client';
import type {
  CommitSortField,
  CommitsQuery,
  CommitsResponse,
  DatasetSummary,
  HistoricalCommit,
  SortDir,
} from '@/api/types';
import { AsyncView } from '@/components/AsyncView';
import { DataTable, type DataTableColumn, type DataTableSort } from '@/components/DataTable';
import { Notice } from '@/components/Notice';
import { PageHeader } from '@/components/PageHeader';
import { ProvisionalNotice } from '@/components/ProvisionalNotice';
import { RiskChip } from '@/components/RiskChip';
import { useApi } from '@/hooks/useApi';
import { useHealth } from '@/hooks/useHealth';
import { formatMetric } from '@/lib/format';
import { mockCommitsFor } from '@/mocks/commits.mock';
import { mockDatasetSummary } from '@/mocks/datasetSummary.mock';

const PAGE_SIZE = 10;
const ALL_PROJECTS = '';
const SORT_FIELDS: CommitSortField[] = ['commit_id', 'project', 'risk_score', 'outcome'];

function isSortField(key: string): key is CommitSortField {
  return (SORT_FIELDS as string[]).includes(key);
}

function outcomeLabel(outcome: string): string {
  if (outcome === 'buggy') return 'Buggy';
  if (outcome === 'clean') return 'Clean';
  return outcome;
}

function buildColumns(scoreHeader: string): DataTableColumn<HistoricalCommit>[] {
  return [
    {
      key: 'commit_id',
      header: 'Commit ID',
      sortable: true,
      cell: (r) => <span className="commit-id">{r.commit_id}</span>,
    },
    { key: 'project', header: 'Project', sortable: true, cell: (r) => r.project },
    {
      key: 'risk_score',
      header: scoreHeader,
      sortable: true,
      numeric: true,
      cell: (r) => (
        <span className="inline-flex items-center justify-end gap-2">
          {formatMetric(r.risk_score)}
          {r.risk_band ? <RiskChip band={r.risk_band} /> : null}
        </span>
      ),
    },
    {
      key: 'outcome',
      header: 'Historical outcome',
      sortable: true,
      cell: (r) => outcomeLabel(r.outcome),
    },
  ];
}

export function CommitRankingPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: CommitSortField; dir: SortDir }>({ key: 'risk_score', dir: 'desc' });
  const [project, setProject] = useState(ALL_PROJECTS);
  const projectSelectId = useId();

  const health = useHealth();
  const summary = useApi<DatasetSummary>('/dataset-summary', { mock: mockDatasetSummary });

  const query: CommitsQuery = {
    page,
    page_size: PAGE_SIZE,
    sort_by: sort.key,
    sort_dir: sort.dir,
    ...(project !== ALL_PROJECTS ? { project } : {}),
  };
  const mock = useMemo(
    () => (isMockMode() ? mockCommitsFor(query) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, sort.key, sort.dir, project],
  );
  const { state, reload } = useApi<CommitsResponse>('/commits', { params: { ...query }, mock });

  const handleSort = (next: DataTableSort) => {
    if (isSortField(next.key)) {
      setSort({ key: next.key, dir: next.dir });
      setPage(1);
    }
  };

  const projects = summary.state.status === 'success' ? summary.state.data.projects : [];

  return (
    <>
      <PageHeader
        title="Commit ranking"
        description="Historical commits ranked by risk score, shown with the outcome that was later recorded for each one."
      />

      <div className="mb-6 flex flex-col gap-3">
        <Notice variant="retrospective">
          This is a ranking of historical commits whose outcomes are already known. It is not live GitHub analysis:
          CodePulse does not read live commits, and these rows are not predictions about new work.
        </Notice>
        <ProvisionalNotice
          status={health.state.status === 'success' ? health.state.data.model_status : null}
          subject="The risk scores on this page"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={projectSelectId} className="text-xs text-muted-foreground">
            Project
          </label>
          <select
            id={projectSelectId}
            value={project}
            disabled={summary.state.status !== 'success'}
            onChange={(e) => {
              setProject(e.target.value);
              setPage(1);
            }}
            className="h-9 min-w-48 rounded-md border border-border bg-surface px-3 text-sm"
          >
            <option value={ALL_PROJECTS}>All projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        {summary.state.status === 'loading' ? (
          <p role="status" className="m-0 pb-2 text-sm text-muted-foreground">
            Loading projects
          </p>
        ) : null}
        {summary.state.status === 'error' ? (
          <p className="m-0 pb-1.5 text-sm text-risk-high" role="alert">
            Projects could not be loaded: {summary.state.error.message}{' '}
            <button type="button" className="underline underline-offset-2" onClick={summary.reload}>
              Try again
            </button>
          </p>
        ) : null}
      </div>

      <AsyncView
        state={state}
        reload={reload}
        what="Commit ranking"
        isEmpty={(d) => !Array.isArray(d.commits) || d.commits.length === 0}
        emptyTitle="No commits to show"
        emptyDescription={
          project !== ALL_PROJECTS
            ? `The API returned no commits for ${project}. Choose another project or all projects.`
            : 'The API responded but returned no commits for this view.'
        }
      >
        {(data) => {
          const isProbability = data.commits.length > 0 && data.commits.every((c) => c.score_type === 'probability');
          return (
            <div className="flex flex-col gap-3">
              <DataTable
                caption="Historical commits ranked by risk score"
                columns={buildColumns(isProbability ? 'Probability' : 'Relative risk score')}
                rows={data.commits}
                getRowId={(r) => r.commit_id}
                sort={sort}
                onSortChange={handleSort}
                pagination={{
                  page: data.page,
                  pageSize: data.page_size,
                  total: data.total,
                  onPageChange: setPage,
                }}
              />
              {!isProbability ? (
                <p className="m-0 max-w-prose text-sm text-muted-foreground">
                  Scores are relative risk scores. They rank commits against each other and are not probabilities.
                </p>
              ) : null}
            </div>
          );
        }}
      </AsyncView>
    </>
  );
}
