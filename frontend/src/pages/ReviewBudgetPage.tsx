import { useId, useState } from 'react';

import type { BudgetPct, RankingMethod, ReviewBudgetResponse, ViewMode } from '@/api/types';
import { AsyncView } from '@/components/AsyncView';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FieldList } from '@/components/FieldList';
import { Notice } from '@/components/Notice';
import { PageHeader } from '@/components/PageHeader';
import { ProvisionalNotice } from '@/components/ProvisionalNotice';
import { SegmentedControl } from '@/components/SegmentedControl';
import { describeChart, type BudgetRow } from '@/components/charts/budgetChartData';
import { ReviewBudgetChart } from '@/components/charts/ReviewBudgetChart';
import { SERIES, SERIES_ORDER } from '@/components/charts/seriesStyle';
import { useApi } from '@/hooks/useApi';
import { useHealth } from '@/hooks/useHealth';
import { formatFraction, formatInt, NOT_AVAILABLE } from '@/lib/format';
import { mockReviewBudgetPerProject, mockReviewBudgetPooled } from '@/mocks/reviewBudget.mock';

const BUDGET_OPTIONS: { value: BudgetPct; label: string }[] = [
  { value: 10, label: 'Top 10%' },
  { value: 20, label: 'Top 20%' },
  { value: 30, label: 'Top 30%' },
];

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'pooled', label: 'All projects pooled' },
  { value: 'per_project', label: 'Per project' },
];

function methodOrder(m: RankingMethod): number {
  return SERIES_ORDER.indexOf(m);
}

function Na() {
  return <span>{NOT_AVAILABLE}</span>;
}

function buildColumns(perProject: boolean): DataTableColumn<BudgetRow>[] {
  const cols: DataTableColumn<BudgetRow>[] = [];
  if (perProject) cols.push({ key: 'project', header: 'Project', cell: (r) => r.project });
  cols.push(
    { key: 'method', header: 'Ranking method', cell: (r) => SERIES[r.method].label },
    { key: 'commits_reviewed', header: 'Commits reviewed', numeric: true, cell: (r) => formatInt(r.commits_reviewed) },
    {
      key: 'buggy_caught',
      header: 'Buggy commits caught',
      numeric: true,
      cell: (r) => (r.buggy_caught == null ? <Na /> : formatInt(r.buggy_caught)),
    },
    {
      key: 'total_buggy',
      header: 'Total buggy commits',
      numeric: true,
      cell: (r) => (r.total_buggy == null ? <Na /> : formatInt(r.total_buggy)),
    },
    { key: 'eval_set_size', header: 'Evaluation-set size', numeric: true, cell: (r) => formatInt(r.eval_set_size) },
    {
      key: 'capture_rate',
      header: 'Capture rate',
      numeric: true,
      cell: (r) => (r.capture_rate == null ? <Na /> : formatFraction(r.capture_rate)),
    },
  );
  return cols;
}

function Results({ data, selected, view }: { data: ReviewBudgetResponse; selected: BudgetPct; view: ViewMode }) {
  const descriptionId = useId();
  const results: BudgetRow[] = data.results;

  if (data.view !== view) {
    return (
      <EmptyState title="Unexpected response">
        The API returned the {data.view === 'pooled' ? 'pooled' : 'per-project'} view when the{' '}
        {view === 'pooled' ? 'pooled' : 'per-project'} view was requested, so nothing is shown.
      </EmptyState>
    );
  }

  const tableRows = results
    .filter((r) => r.budget_pct === selected)
    .sort((a, b) => (a.project ?? '').localeCompare(b.project ?? '') || methodOrder(a.method) - methodOrder(b.method));

  const naProjects = Array.from(
    new Set(tableRows.filter((r) => r.capture_rate == null).map((r) => r.project ?? 'All projects')),
  );

  const chartTitle =
    view === 'pooled'
      ? 'Buggy commits found at each review budget, all projects pooled'
      : `Buggy commits found in the top ${selected}% of commits, by project`;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="chart-heading" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="chart-heading" className="sr-only">
          Chart
        </h2>
        <ReviewBudgetChart
          view={view}
          selected={selected}
          results={results}
          title={chartTitle}
          descriptionId={descriptionId}
        />
        <p id={descriptionId} className="sr-only">
          {describeChart(view, selected, results)}
        </p>
        {view === 'pooled' ? (
          <p className="mt-2 mb-0 text-sm text-muted-foreground">
            All three budgets are shown. The budget chosen above is drawn in full colour and listed in the table.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="table-heading" className="flex flex-col gap-3">
        <h2 id="table-heading" className="m-0 text-lg font-semibold">
          Results for the top {selected}% of commits
        </h2>
        <DataTable
          caption={`Review budget results for the top ${selected}% of commits`}
          columns={buildColumns(view === 'per_project')}
          rows={tableRows}
          getRowId={(r) => `${r.project ?? 'all'}-${r.method}-${r.budget_pct}`}
          emptyMessage={`The API returned no results for the top ${selected}% budget.`}
        />
        {naProjects.length > 0 ? (
          <p className="m-0 max-w-prose text-sm text-muted-foreground">
            <span className="font-semibold text-ink">N/A:</span> {naProjects.join(', ')}{' '}
            {naProjects.length === 1 ? 'has' : 'have'} no buggy commits in the evaluation set, so buggy commits caught,
            total buggy commits and capture rate cannot be calculated. This is a property of the data, not a model
            result.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="policy-heading" className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 id="policy-heading" className="m-0 text-lg font-semibold">
          How the numbers were counted
        </h2>
        <FieldList
          className="sm:grid-cols-2 lg:grid-cols-2"
          items={[
            { label: 'Rounding policy', value: <span className="font-normal">{data.rounding_policy}</span> },
            { label: 'Tie policy', value: <span className="font-normal">{data.tie_policy}</span> },
          ]}
        />
      </section>
    </div>
  );
}

export function ReviewBudgetPage() {
  const [view, setView] = useState<ViewMode>('pooled');
  const [budget, setBudget] = useState<BudgetPct>(20);

  const health = useHealth();
  const { state, reload } = useApi<ReviewBudgetResponse>('/review-budget', {
    params: { view },
    mock: view === 'pooled' ? mockReviewBudgetPooled : mockReviewBudgetPerProject,
  });

  return (
    <>
      <PageHeader
        title="Review budget"
        description="How many buggy commits are found when only the top share of commits is reviewed, compared with random and change-size ranking."
      />

      <div className="mb-6 flex flex-col gap-3">
        <Notice variant="retrospective">
          These are retrospective results: a replay of historical commits whose outcomes are already known. They are not
          live predictions, and CodePulse does not analyse live GitHub commits.
        </Notice>
        <ProvisionalNotice status={health.state.status === 'success' ? health.state.data.model_status : null} subject="The CodePulse results on this page" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Review budget</span>
          <SegmentedControl label="Review budget" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Evaluation view</span>
          <SegmentedControl label="Evaluation view" options={VIEW_OPTIONS} value={view} onChange={setView} />
        </div>
      </div>

      <AsyncView
        state={state}
        reload={reload}
        what="Review budget results"
        isEmpty={(d) => !Array.isArray(d.results) || d.results.length === 0}
        emptyTitle="No review budget results"
        emptyDescription="The API responded but returned no results, so no chart or table is shown."
      >
        {(data) => <Results data={data} selected={budget} view={view} />}
      </AsyncView>
    </>
  );
}
