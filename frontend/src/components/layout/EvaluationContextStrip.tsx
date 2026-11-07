import type { EvaluationContext } from '@/api/types';
import { ErrorState } from '@/components/ErrorState';
import { useApi } from '@/hooks/useApi';
import { mockEvaluationContext } from '@/mocks/evaluationContext.mock';

const numberFormat = new Intl.NumberFormat('en-GB');

function formatIsoDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

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
            {formatIsoDate(ctx.date_range.start)} to {formatIsoDate(ctx.date_range.end)}
          </Field>
          <Field label="Commits">{numberFormat.format(ctx.total_commits)}</Field>
          <Field label="Buggy commits">{numberFormat.format(ctx.buggy_commits)}</Field>
          <Field label="Model version">{ctx.model_version ?? 'Not available'}</Field>
        </dl>
      </div>
    </StripFrame>
  );
}
