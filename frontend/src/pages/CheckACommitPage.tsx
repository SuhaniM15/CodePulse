import { useId, useState, type FormEvent } from 'react';

import {
  FEATURE_CODES,
  type ApiError,
  type ApiFieldError,
  type FeatureCode,
  type FeatureImportanceResponse,
  type PredictRequest,
  type PredictResponse,
} from '@/api/types';
import { AsyncView } from '@/components/AsyncView';
import { ErrorState } from '@/components/ErrorState';
import { PageHeader } from '@/components/PageHeader';
import { ProvisionalNotice } from '@/components/ProvisionalNotice';
import { RiskChip } from '@/components/RiskChip';
import { FeatureImportanceChart } from '@/components/charts/FeatureImportanceChart';
import { Button } from '@/components/ui/button';
import { FEATURE_DEFINITIONS } from '@/content/featureDefinitions';
import { useApi } from '@/hooks/useApi';
import { useHealth } from '@/hooks/useHealth';
import { usePredict } from '@/hooks/usePredict';
import { formatMetric } from '@/lib/format';
import { cn } from '@/lib/utils';
import { mockFeatureImportance } from '@/mocks/featureImportance.mock';

type FormValues = Record<FeatureCode, string>;
type FieldErrors = Partial<Record<FeatureCode, string>>;

const EMPTY_VALUES = Object.fromEntries(FEATURE_CODES.map((c) => [c, ''])) as FormValues;
const NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

/** Required, numeric and non-negative. Returns the request only if every field is valid. */
function validate(values: FormValues): { request: PredictRequest | null; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const numbers: Partial<PredictRequest> = {};
  for (const code of FEATURE_CODES) {
    const raw = values[code].trim();
    if (raw === '') {
      errors[code] = 'Required';
    } else if (!NUMBER_PATTERN.test(raw)) {
      errors[code] = 'Enter a number';
    } else if (Number(raw) < 0) {
      errors[code] = 'Must be 0 or greater';
    } else {
      numbers[code] = Number(raw);
    }
  }
  return Object.keys(errors).length === 0
    ? { request: numbers as PredictRequest, errors }
    : { request: null, errors };
}

/** Split a 422 into messages for known fields and everything else. */
function splitApiErrors(error: ApiError): { byField: FieldErrors; rest: ApiError | null } {
  if (error.status !== 422 || !error.field_errors?.length) return { byField: {}, rest: error };
  const byField: FieldErrors = {};
  const unmatched: ApiFieldError[] = [];
  for (const fe of error.field_errors) {
    if ((FEATURE_CODES as readonly string[]).includes(fe.field)) {
      const code = fe.field as FeatureCode;
      byField[code] = byField[code] ? `${byField[code]}; ${fe.message}` : fe.message;
    } else {
      unmatched.push(fe);
    }
  }
  const rest: ApiError | null =
    unmatched.length > 0
      ? { ...error, message: 'The API rejected some of the values entered.', field_errors: unmatched }
      : null;
  return { byField, rest };
}

function FeatureField({
  code,
  value,
  error,
  onChange,
}: {
  code: FeatureCode;
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {code}
      </label>
      <input
        id={id}
        name={code}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        className={cn(
          'h-9 w-full rounded-md border bg-surface px-3 text-sm tabular-nums',
          error ? 'border-risk-high' : 'border-border',
        )}
      />
      <p id={helpId} className="m-0 text-xs text-muted-foreground">
        Definition: {FEATURE_DEFINITIONS[code].definition}
      </p>
      {error ? (
        <p id={errorId} className="m-0 text-xs font-medium text-risk-high">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Result({ data }: { data: PredictResponse }) {
  const isProbability = data.score_type === 'probability';
  return (
    <section
      aria-labelledby="result-heading"
      aria-live="polite"
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5"
    >
      <h2 id="result-heading" className="m-0 text-lg font-semibold">
        Result
      </h2>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="m-0 text-xs text-muted-foreground">{isProbability ? 'Probability' : 'Relative risk score'}</p>
          <p className="m-0 text-4xl leading-tight font-semibold tabular-nums">{formatMetric(data.risk_score)}</p>
        </div>
        {data.risk_band ? (
          <div className="pb-1.5">
            <RiskChip band={data.risk_band} />
          </div>
        ) : null}
      </div>
      <p className="m-0 max-w-prose">
        This is an estimate from a model, not a finding.{' '}
        {isProbability
          ? 'The API reports this score as a probability.'
          : 'A relative risk score helps rank commits against each other. It is not the chance that this commit contains a bug.'}{' '}
        Inspect and test the change as you normally would.
      </p>
      {data.notice ? (
        <p className="m-0 max-w-prose border-l-2 border-border pl-3 text-sm text-muted-foreground">{data.notice}</p>
      ) : null}
      <p className="m-0 text-xs text-muted-foreground">
        Model version <span className="tabular-nums">{data.model_version}</span>
      </p>
    </section>
  );
}

export function CheckACommitPage() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  // Fields edited since the last submit; their API messages are no longer current.
  const [edited, setEdited] = useState<FeatureCode[]>([]);

  const health = useHealth();
  const predict = usePredict();
  const importance = useApi<FeatureImportanceResponse>('/feature-importance', { mock: mockFeatureImportance });

  const result = predict.state.status === 'success' ? predict.state.data : null;
  const modelStatus = result?.model_status ?? (health.state.status === 'success' ? health.state.data.model_status : null);
  const busy = predict.state.status === 'loading';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { request, errors: found } = validate(values);
    setErrors(found);
    setEdited([]);
    if (!request) return;
    await predict.submit(request);
  };

  const onChange = (code: FeatureCode, value: string) => {
    setValues((v) => ({ ...v, [code]: value }));
    setErrors((e) => ({ ...e, [code]: undefined }));
    setEdited((list) => (list.includes(code) ? list : [...list, code]));
  };

  const failure = predict.state.status === 'error' ? splitApiErrors(predict.state.error) : null;
  // 422 messages from the API appear beside their fields until that field is edited.
  const apiFieldErrors: FieldErrors = { ...failure?.byField };
  for (const code of edited) delete apiFieldErrors[code];
  const fieldErrors: FieldErrors = { ...apiFieldErrors, ...errors };

  return (
    <>
      <PageHeader
        title="Check a commit"
        description="Enter commit metrics to get a model score, and see which features matter to the model overall."
      />

      <div className="mb-6 flex flex-col gap-3">
        <ProvisionalNotice status={modelStatus} subject="The score and importance values on this page" />
        <p className="m-0 max-w-prose text-sm text-muted-foreground">
          This page gives a live model estimate for the numbers you enter. It is not a historical result, and CodePulse does
          not read commits from GitHub.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <section aria-labelledby="form-heading" className="flex flex-col gap-4">
          <h2 id="form-heading" className="m-0 text-lg font-semibold">
            Commit metrics
          </h2>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <p className="m-0 text-sm text-muted-foreground">
              All twelve values are required. Each must be a number that is 0 or greater.
            </p>
            {Object.keys(errors).length > 0 ? (
              <p role="alert" className="m-0 text-sm font-medium text-risk-high">
                Fix the highlighted fields and try again.
              </p>
            ) : null}
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CODES.map((code) => (
                <FeatureField
                  key={code}
                  code={code}
                  value={values[code]}
                  error={fieldErrors[code]}
                  onChange={(v) => onChange(code, v)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={busy}>
                {busy ? 'Getting estimate' : 'Get estimate'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setValues(EMPTY_VALUES);
                  setErrors({});
                  setEdited([]);
                  predict.reset();
                }}
              >
                Clear
              </Button>
            </div>
          </form>

          {predict.state.status === 'loading' ? (
            <p role="status" className="m-0 text-sm text-muted-foreground">
              Waiting for the model
            </p>
          ) : null}
          {failure?.rest ? <ErrorState title="The estimate" error={failure.rest} onRetry={predict.retry} /> : null}
          {predict.state.status === 'error' && failure && !failure.rest ? (
            <p role="alert" className="m-0 text-sm font-medium text-risk-high">
              The API rejected some values. See the messages beside each field.
            </p>
          ) : null}
        </section>

        {result ? <Result data={result} /> : null}

        <section aria-labelledby="importance-heading" className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 id="importance-heading" className="m-0 text-lg font-semibold">
            Global feature importance
          </h2>
          <AsyncView
            state={importance.state}
            reload={importance.reload}
            what="Feature importance"
            isEmpty={(d) => !Array.isArray(d.features) || d.features.length === 0}
            emptyTitle="No feature importance to show"
            emptyDescription="The API responded but returned no importance values, so no chart is drawn."
          >
            {(data) => (
              <>
                <p className="m-0 max-w-prose font-medium">
                  Global importance across the evaluation data, not the cause of risk in this commit
                </p>
                <p className="m-0 text-sm text-muted-foreground">
                  Method: {data.method}. Model version: <span className="tabular-nums">{data.model_version}</span>. Values
                  are magnitudes only.
                </p>
                <FeatureImportanceChart data={data} title="Importance of each feature across the evaluation data" />
              </>
            )}
          </AsyncView>
        </section>
      </div>
    </>
  );
}
