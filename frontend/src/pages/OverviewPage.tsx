import { Link } from 'react-router-dom';

import type {
  CaptureCurveResponse,
  DatasetSummary,
  EvaluationContext,
  ModelMetricsResponse,
  ReviewBudgetResponse,
} from '@/api/types';
import { AsyncView } from '@/components/AsyncView';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FieldList } from '@/components/FieldList';
import { Notice } from '@/components/Notice';
import { PageHeader } from '@/components/PageHeader';
import { ProvisionalNotice } from '@/components/ProvisionalNotice';
import { CaptureCurveChart } from '@/components/charts/CaptureCurveChart';
import { useApi } from '@/hooks/useApi';
import { useHealth } from '@/hooks/useHealth';
import { formatFraction, formatInt, formatMetric } from '@/lib/format';
import { mockCaptureCurve } from '@/mocks/captureCurve.mock';
import { mockDatasetSummary } from '@/mocks/datasetSummary.mock';
import { mockEvaluationContext } from '@/mocks/evaluationContext.mock';
import { mockModelMetrics } from '@/mocks/metrics.mock';
import { mockReviewBudgetPooled } from '@/mocks/reviewBudget.mock';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatIsoDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : dateFormat.format(d);
}

/**
 * Builds the headline from the pooled review-budget results at the 20% budget
 * (CodePulse versus random), using only values returned by the API. Returns
 * null when any needed value is missing; nothing is filled in.
 */
function buildHeadline(data: ReviewBudgetResponse): { sentence: string; evalSetSize: number } | null {
  if (data.view !== 'pooled' || !Array.isArray(data.results)) return null;
  const at20 = data.results.filter((r) => r.budget_pct === 20);
  const model = at20.find((r) => r.method === 'model');
  const random = at20.find((r) => r.method === 'random');
  if (!model || !random) return null;
  if (
    model.buggy_caught == null ||
    model.total_buggy == null ||
    model.capture_rate == null ||
    random.buggy_caught == null ||
    random.total_buggy == null ||
    random.capture_rate == null
  ) {
    return null;
  }
  const sentence =
    `In the historical replay, reviewing the top ${model.budget_pct}% of commits ranked by CodePulse found ` +
    `${formatInt(model.buggy_caught)} of ${formatInt(model.total_buggy)} buggy commits ` +
    `(${formatFraction(model.capture_rate)}), compared with ${formatInt(random.buggy_caught)} of ` +
    `${formatInt(random.total_buggy)} (${formatFraction(random.capture_rate)}) when commits were ranked randomly.`;
  return { sentence, evalSetSize: model.eval_set_size };
}

function Hero() {
  const budget = useApi<ReviewBudgetResponse>('/review-budget', {
    params: { view: 'pooled' },
    mock: mockReviewBudgetPooled,
  });
  const curve = useApi<CaptureCurveResponse>('/capture-curve', { mock: mockCaptureCurve });

  return (
    <section aria-labelledby="hero-heading" className="rounded-lg border border-border bg-surface p-5 md:p-7">
      <h2 id="hero-heading" className="sr-only">
        Headline result and capture curve
      </h2>

      <AsyncView state={budget.state} reload={budget.reload} what="Headline result">
        {(data) => {
          const headline = buildHeadline(data);
          return headline ? (
            <div className="mb-6 max-w-3xl">
              <p className="m-0 text-xl leading-snug font-semibold md:text-2xl">{headline.sentence}</p>
              <p className="mt-2 mb-0 text-sm text-muted-foreground">
                Evaluation set of {formatInt(headline.evalSetSize)} commits. See the{' '}
                <Link to="/review-budget" className="underline underline-offset-2">
                  review budget page
                </Link>{' '}
                for every budget and the per-project results.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <EmptyState title="No headline result is available">
                The headline needs pooled review-budget results at the 20% budget for both CodePulse and random ranking,
                including the number of buggy commits caught and the total. The API response is missing at least one of
                these values, so no sentence is shown rather than an estimate.
              </EmptyState>
            </div>
          );
        }}
      </AsyncView>

      <AsyncView
        state={curve.state}
        reload={curve.reload}
        what="Capture curve"
        isEmpty={(d) => !Array.isArray(d.series) || d.series.length === 0}
        emptyTitle="The capture curve is not available"
        emptyDescription="The API responded but returned no curve series, so no chart is drawn."
      >
        {(data) => (
          <CaptureCurveChart data={data} title="Buggy commits found as more commits are reviewed" />
        )}
      </AsyncView>
    </section>
  );
}

function DatasetSection() {
  const { state, reload } = useApi<DatasetSummary>('/dataset-summary', { mock: mockDatasetSummary });
  return (
    <section aria-labelledby="dataset-heading" className="flex flex-col gap-3">
      <div>
        <h2 id="dataset-heading" className="m-0 text-lg font-semibold">
          Full dataset
        </h2>
        <p className="m-0 mt-1 max-w-prose text-sm text-muted-foreground">
          Every commit in the dataset, before any split. These figures are separate from the evaluation split.
        </p>
      </div>
      <AsyncView state={state} reload={reload} what="Dataset summary">
        {(d) => (
          <>
            <FieldList
              items={[
                { label: 'Commits', value: formatInt(d.total_commits) },
                { label: 'Buggy commits', value: formatInt(d.buggy_commits) },
                { label: 'Buggy rate', value: formatFraction(d.buggy_rate) },
                { label: 'Projects', value: formatInt(d.projects?.length) },
              ]}
            />
            {d.per_project && d.per_project.length > 0 ? (
              <DataTable
                caption="Full dataset commits by project"
                columns={[
                  { key: 'project', header: 'Project', cell: (r) => r.project },
                  { key: 'total', header: 'Commits', numeric: true, cell: (r) => formatInt(r.total_commits) },
                  { key: 'buggy', header: 'Buggy commits', numeric: true, cell: (r) => formatInt(r.buggy_commits) },
                ]}
                rows={d.per_project}
                getRowId={(r) => r.project}
              />
            ) : null}
          </>
        )}
      </AsyncView>
    </section>
  );
}

function EvaluationSection() {
  const { state, reload } = useApi<EvaluationContext>('/evaluation-context', { mock: mockEvaluationContext });
  return (
    <section aria-labelledby="split-heading" className="flex flex-col gap-3">
      <div>
        <h2 id="split-heading" className="m-0 text-lg font-semibold">
          Evaluation split
        </h2>
        <p className="m-0 mt-1 max-w-prose text-sm text-muted-foreground">
          The subset of commits used to produce the results on this site.
        </p>
      </div>
      <AsyncView state={state} reload={reload} what="Evaluation split">
        {(c) => (
          <FieldList
            items={[
              { label: 'Split name', value: c.split_name },
              ...(c.split_type ? [{ label: 'Split type', value: c.split_type }] : []),
              {
                label: 'Date range',
                value: `${formatIsoDate(c.date_range.start)} to ${formatIsoDate(c.date_range.end)}`,
              },
              { label: 'Commits', value: formatInt(c.total_commits) },
              { label: 'Buggy commits', value: formatInt(c.buggy_commits) },
              { label: 'Model version', value: c.model_version ?? 'Not available' },
            ]}
          />
        )}
      </AsyncView>
    </section>
  );
}

function ModelSummary() {
  const { state, reload } = useApi<ModelMetricsResponse>('/metrics', { mock: mockModelMetrics });
  return (
    <section aria-labelledby="model-heading" className="flex flex-col gap-3 border-t border-border pt-6">
      <h2 id="model-heading" className="m-0 text-lg font-semibold">
        Selected model
      </h2>
      <AsyncView
        state={state}
        reload={reload}
        what="Model summary"
        isEmpty={(d) => !Array.isArray(d.models) || !d.models.some((m) => m.is_active)}
        emptyTitle="No model is marked as selected"
        emptyDescription="The API returned model metrics but none is flagged as the selected model, so no summary is shown."
      >
        {(d) => {
          const model = d.models.find((m) => m.is_active);
          if (!model) return null;
          return (
            <>
              <ProvisionalNotice status={model.model_status} subject="This model summary" />
              <FieldList
                items={[
                  { label: 'Model', value: model.model_name },
                  { label: 'Status', value: model.model_status === 'provisional' ? 'Provisional' : 'Final' },
                  { label: 'PR-AUC', value: formatMetric(model.pr_auc) },
                  { label: 'ROC-AUC', value: formatMetric(model.roc_auc) },
                  { label: 'Precision', value: formatMetric(model.precision) },
                  { label: 'Recall', value: formatMetric(model.recall) },
                  { label: 'F1', value: formatMetric(model.f1) },
                  { label: 'MCC', value: formatMetric(model.mcc) },
                ]}
              />
              <p className="m-0 text-sm text-muted-foreground">
                Metrics are measured on the evaluation split above.{' '}
                <Link to="/models" className="underline underline-offset-2">
                  Compare all models
                </Link>
                .
              </p>
            </>
          );
        }}
      </AsyncView>
    </section>
  );
}

export function OverviewPage() {
  const health = useHealth();
  const status = health.state.status === 'success' ? health.state.data.model_status : null;

  return (
    <>
      <PageHeader
        title="Overview"
        description="CodePulse scores software commits by their estimated risk of introducing a bug, so reviewers with limited time can look at the riskiest commits first."
      />

      <div className="mb-6 flex flex-col gap-3">
        <Notice variant="retrospective">
          Every result here is a retrospective replay of historical commits with known outcomes. It is not live analysis,
          and CodePulse does not read live GitHub commits.
        </Notice>
        <ProvisionalNotice status={status} subject="The CodePulse results on this page" />
      </div>

      <div className="flex flex-col gap-10">
        <Hero />

        <section aria-labelledby="intended-heading" className="max-w-prose border-l-2 border-model pl-4">
          <h2 id="intended-heading" className="m-0 text-lg font-semibold">
            Intended use
          </h2>
          <p className="mt-1 mb-0">
            CodePulse is decision support. It helps decide which commits to review first when time is short. It does not
            replace code review, testing or human merge decisions, and it is not a merge gate.
          </p>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <DatasetSection />
          <EvaluationSection />
        </div>

        <ModelSummary />
      </div>
    </>
  );
}