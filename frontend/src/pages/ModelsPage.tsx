import type { ModelMetricsEntry, ModelMetricsResponse } from '@/api/types';
import { AsyncView } from '@/components/AsyncView';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { FieldList } from '@/components/FieldList';
import { Notice } from '@/components/Notice';
import { PageHeader } from '@/components/PageHeader';
import { ProvisionalNotice } from '@/components/ProvisionalNotice';
import { useApi } from '@/hooks/useApi';
import { formatDateRange, formatInt, formatMetric } from '@/lib/format';
import { mockModelMetrics } from '@/mocks/metrics.mock';

function metricColumn(
  key: string,
  header: string,
  value: (m: ModelMetricsEntry) => number | null | undefined,
): DataTableColumn<ModelMetricsEntry> {
  return { key, header, numeric: true, cell: (m) => formatMetric(value(m)) };
}

function buildColumns(showBrier: boolean): DataTableColumn<ModelMetricsEntry>[] {
  return [
    {
      key: 'model',
      header: 'Model',
      cell: (m) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="font-medium">{m.model_name}</span>
          {m.is_active ? (
            <span className="rounded-sm border border-model px-1.5 py-0.5 text-xs font-medium text-model">
              Active model
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (m) => (m.model_status === 'provisional' ? 'Provisional' : 'Final'),
    },
    metricColumn('pr_auc', 'PR-AUC', (m) => m.pr_auc),
    metricColumn('roc_auc', 'ROC-AUC', (m) => m.roc_auc),
    metricColumn('precision', 'Precision', (m) => m.precision),
    metricColumn('recall', 'Recall', (m) => m.recall),
    metricColumn('f1', 'F1', (m) => m.f1),
    metricColumn('mcc', 'MCC', (m) => m.mcc),
    ...(showBrier ? [metricColumn('brier', 'Brier', (m) => m.brier)] : []),
    metricColumn('threshold', 'Threshold', (m) => m.threshold),
    {
      key: 'threshold_method',
      header: 'How the threshold was selected',
      cell: (m) =>
        m.threshold_method ? (
          <span className="inline-block min-w-48 whitespace-normal">{m.threshold_method}</span>
        ) : (
          'N/A'
        ),
    },
  ];
}

function Content({ data }: { data: ModelMetricsResponse }) {
  const ctx = data.evaluation_context;
  const showBrier = data.models.some((m) => m.brier !== undefined);
  const anyProvisional = data.models.some((m) => m.model_status === 'provisional');

  return (
    <div className="flex flex-col gap-8">
      <ProvisionalNotice
        status={anyProvisional ? 'provisional' : 'final'}
        subject="The metrics on this page"
      />

      <section aria-labelledby="split-heading" className="flex flex-col gap-3">
        <div>
          <h2 id="split-heading" className="m-0 text-lg font-semibold">
            Evaluation split
          </h2>
          <p className="m-0 mt-1 max-w-prose text-sm text-muted-foreground">
            Every metric below was measured on this split.
          </p>
        </div>
        {ctx ? (
          <FieldList
            items={[
              { label: 'Split name', value: ctx.split_name },
              ...(ctx.split_type ? [{ label: 'Split type', value: ctx.split_type }] : []),
              {
                label: 'Date range',
                value: formatDateRange(ctx.date_range),
              },
              { label: 'Commits', value: formatInt(ctx.total_commits) },
              { label: 'Buggy commits', value: formatInt(ctx.buggy_commits) },
              { label: 'Model version', value: ctx.model_version ?? 'Not available' },
            ]}
          />
        ) : (
          <p className="m-0 text-sm text-muted-foreground">
            The API did not include the evaluation split for these metrics.
          </p>
        )}
      </section>

      <section aria-labelledby="compare-heading" className="flex flex-col gap-3">
        <h2 id="compare-heading" className="m-0 text-lg font-semibold">
          Model comparison
        </h2>
        <DataTable
          caption="Model comparison on the evaluation split"
          columns={buildColumns(showBrier)}
          rows={data.models}
          getRowId={(m) => m.model_id}
        />
        <p className="m-0 max-w-prose text-sm text-muted-foreground">
          N/A means the API did not report that value for the model.
        </p>
      </section>

      <section aria-labelledby="calibration-heading" className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 id="calibration-heading" className="m-0 text-lg font-semibold">
          Calibration
        </h2>
        {data.calibration_available === true ? (
          <p className="m-0 max-w-prose">
            The API reports that calibration is available for these models. Brier scores are shown in the table where the
            API supplied them. A calibration plot is not drawn yet because no calibration data contract has been agreed.
          </p>
        ) : (
          <p className="m-0 max-w-prose">
            Scores are relative risk scores, not probabilities, unless calibration is validated. The API reports that
            calibration is not available, so no calibration results are shown.
          </p>
        )}
      </section>
    </div>
  );
}

export function ModelsPage() {
  const { state, reload } = useApi<ModelMetricsResponse>('/metrics', { mock: mockModelMetrics });

  return (
    <>
      <PageHeader
        title="Models"
        description="Comparison of the evaluated models on the evaluation split."
      />
      <div className="mb-6">
        <Notice variant="retrospective">
          These metrics describe how each model performed on historical commits whose outcomes are known. They are not
          measurements of live use.
        </Notice>
      </div>
      <AsyncView
        state={state}
        reload={reload}
        what="Model metrics"
        isEmpty={(d) => !Array.isArray(d.models) || d.models.length === 0}
        emptyTitle="No models to compare"
        emptyDescription="The API responded but returned no models, so no comparison is shown."
      >
        {(data) => <Content data={data} />}
      </AsyncView>
    </>
  );
}
