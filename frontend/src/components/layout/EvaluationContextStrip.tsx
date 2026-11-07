import type { EvaluationContext } from '@/api/types';
import { ErrorState } from '@/components/ErrorState';
import { ProvisionalNotice } from '@/components/ProvisionalNotice';
import { useApi } from '@/hooks/useApi';
import { useHealth } from '@/hooks/useHealth';
import { formatDateRange } from '@/lib/format';
import { mockEvaluationContext } from '@/mocks/evaluationContext.mock';

const numberFormat = new Intl.NumberFormat('en-GB');

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="m-0 text-sm font-medium tabular-nums break-words">{children}</dd>
    </div>
  );
}

function StripFrame({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-label="Evaluation context"
      className="border-b border-border bg-surface px-4 py-3 shadow-strip md:px-8"
    >
      {children}
    </section>
  );
}

/**
 * Persistent evaluation-context strip. It reads GET /evaluation-context and
 * nothing else. Fields are labelled separately; nothing is joined with
 * separators and no date range is hard-coded.
 */
export function EvaluationContextStrip() {
  const { state, reload } = useApi<EvaluationContext>('/evaluation-context', {
    mock: mockEvaluationContext,
  });
  const health = useHealth();

  if (state.status === 'loading') {
    return (
      <StripFrame>
        <p role="status" className="text-sm text-muted-foreground">
          Loading evaluation context
        </p>
      </StripFrame>
    );
  }

  if (state.status === 'error') {
    return (
      <StripFrame>
        <ErrorState title="Evaluation context" error={state.error} onRetry={reload} />
      </StripFrame>
    );
  }

  const ctx = state.data;

  return (
    <StripFrame>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Evaluation context</p>
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 xl:grid-cols-5">
          <Field label="Split name">{ctx.split_name}</Field>
          <Field label="Date range">
            {formatDateRange(ctx.date_range)}
          </Field>
          <Field label="Commits">{numberFormat.format(ctx.total_commits)}</Field>
          <Field label="Buggy commits">{numberFormat.format(ctx.buggy_commits)}</Field>
          <Field label="Model version">{ctx.model_version ?? 'Not available'}</Field>
        </dl>
        {health.state.status === 'success' ? (
          <ProvisionalNotice
            status={health.state.data.model_status}
            className="mt-1"
          >
            The model is provisional. Scores and metrics in this interface are for
            integration and are not final results.
          </ProvisionalNotice>
        ) : null}
        {health.state.status === 'error' ? (
          <p className="m-0 text-sm text-muted-foreground">
            Model status could not be checked: {health.state.error.message}{' '}
            <button type="button" className="underline underline-offset-2" onClick={health.reload}>
              Try again
            </button>
          </p>
        ) : null}
      </div>
    </StripFrame>
  );
}
