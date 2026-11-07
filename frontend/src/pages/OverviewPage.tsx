import type { ReactNode } from 'react';
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
import { Notice } from '@/components/Notice';
import { PageHeader } from '@/components/PageHeader';
import { ProvisionalNotice } from '@/components/ProvisionalNotice';
import { CaptureCurveChart } from '@/components/charts/CaptureCurveChart';
import { useApi } from '@/hooks/useApi';
import { useHealth } from '@/hooks/useHealth';
import { formatDateRange, formatFraction, formatInt, formatMetric } from '@/lib/format';
import { cn } from '@/lib/utils';
import { mockCaptureCurve } from '@/mocks/captureCurve.mock';
import { mockDatasetSummary } from '@/mocks/datasetSummary.mock';
import { mockEvaluationContext } from '@/mocks/evaluationContext.mock';
import { mockModelMetrics } from '@/mocks/metrics.mock';
import { mockReviewBudgetPooled } from '@/mocks/reviewBudget.mock';

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

/** One labelled statistic. Cards sit inside a `<dl>` so each label stays tied to its value. */
function StatCard({
  label,
  value,
  note,
  compact,
  className,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 rounded-lg border border-border bg-surface px-4 py-3', className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('m-0 mt-1 leading-tight font-semibold tabular-nums break-words', compact ? 'text-base' : 'text-xl')}>
        {value}
      </dd>
      {note ? <dd className="m-0 mt-1 text-xs text-muted-foreground">{note}</dd> : null}
    </div>
  );
}

function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('m-0 grid grid-cols-2 gap-3', className)}>{children}</dl>;
}

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div>
      <h2 id={id} className="m-0 text-lg font-semibold">
        {title}
      </h2>
      <p className="m-0 mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
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
      <SectionHeading
        id="dataset-heading"
        title="Full dataset"
        description="All commits, before any split. Separate from the evaluation split."
      />
      <AsyncView state={state} reload={reload} what="Dataset summary">
        {(d) => (
          <>
            <StatGrid>
              <StatCard label="Commits" value={formatInt(d.total_commits)} />
              <StatCard label="Buggy commits" value={formatInt(d.buggy_commits)} />
              <StatCard label="Buggy rate" value={formatFraction(d.buggy_rate)} />
              <StatCard label="Projects" value={formatInt(d.projects?.length)} />
            </StatGrid>
            {d.per_project && d.per_project.length > 0 ? (
              <details>
                <summary className="w-fit cursor-pointer text-sm underline underline-offset-2">
                  Show commits by project
                </summary>
                <div className="mt-2">
                  <DataTable
                    caption="Full dataset commits by project"
                    columns={[
                      { key: 'project', header: 'Project', cell: (r) => r.project },
                      { key: 'total', header: 'Commits', numeric: true, cell: (r) => formatInt(r.total_commits) },
                      {
                        key: 'buggy',
                        header: 'Buggy commits',
                        numeric: true,
                        cell: (r) => formatInt(r.buggy_commits),
                      },
                    ]}
                    rows={d.per_project}
                    getRowId={(r) => r.project}
                  />
                </div>
              </details>
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
      <SectionHeading
        id="split-heading"
        title="Evaluation split"
        description="The commits used to produce the results on this site."
      />
      <AsyncView state={state} reload={reload} what="Evaluation split">
        {(c) => (
          <StatGrid>
            <StatCard
              label="Split name"
              value={c.split_name}
              note={c.split_type ? <>Split type: {c.split_type}</> : undefined}
            />
            <StatCard label="Date range" value={formatDateRange(c.date_range)} compact />
            <StatCard label="Commits" value={formatInt(c.total_commits)} />
            <StatCard label="Buggy commits" value={formatInt(c.buggy_commits)} />
            <StatCard label="Model version" value={c.model_version ?? 'Not available'} className="col-span-2" />
          </StatGrid>
        )}
      </AsyncView>
    </section>
  );
}

function ModelSummary() {
  const { state, reload } = useApi<ModelMetricsResponse>('/metrics', { mock: mockModelMetrics });
  return (
    <section aria-labelledby="model-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <SectionHeading
          id="model-heading"
          title="Selected model"
          description="Measured on the evaluation split above."
        />
        <Link to="/models" className="text-sm underline underline-offset-2">
          Compare all models and metrics
        </Link>
      </div>
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
              <StatGrid className="sm:grid-cols-4">
                <StatCard label="Model" value={model.model_name} compact />
                <StatCard
                  label="Status"
                  value={model.model_status === 'provisional' ? 'Provisional' : 'Final'}
                  compact
                />
                <StatCard label="PR-AUC" value={formatMetric(model.pr_auc)} />
                <StatCard label="ROC-AUC" value={formatMetric(model.roc_auc)} />
              </StatGrid>
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

      <div className="flex flex-col gap-8">
        <Hero />

        <div className="grid gap-8 lg:grid-cols-2">
          <DatasetSection />
          <EvaluationSection />
        </div>

        <ModelSummary />

        <section aria-labelledby="intended-heading" className="max-w-prose border-l-2 border-model pl-4">
          <h2 id="intended-heading" className="m-0 text-lg font-semibold">
            Intended use and limitations
          </h2>
          <p className="mt-1 mb-2">
            CodePulse is decision support for choosing which commits to review first. It is not a merge gate and does not
            replace code review or testing.
          </p>
          <ul className="m-0 list-disc pl-5 text-sm text-muted-foreground">
            <li>Results are retrospective, not live analysis.</li>
            <li>Not validated for other teams, languages or projects without retraining.</li>
            <li>Labels are noisy, so treat every metric as an estimate.</li>
          </ul>
          <p className="mt-2 mb-0 text-sm">
            <Link to="/about" className="underline underline-offset-2">
              Read the full limitations
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
