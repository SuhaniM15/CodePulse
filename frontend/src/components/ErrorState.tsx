import { CircleAlert } from 'lucide-react';

import { CONFIG_ERROR_CODE } from '@/api/client';
import type { ApiError } from '@/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error: ApiError;
  /** Recovery action. Wire this to the `reload` returned by useApi. */
  onRetry?: () => void;
  /** What failed, in plain words, e.g. "Evaluation context". */
  title?: string;
  className?: string;
}

/**
 * Error state for failed API calls. Shows the API's own message verbatim,
 * never a generic apology, and offers a recovery action.
 */
export function ErrorState({ error, onRetry, title, className }: ErrorStateProps) {
  const isConfig = error.error_code === CONFIG_ERROR_CODE;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-risk-high bg-surface px-4 py-3 text-sm',
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-risk-high" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title ? `${title} could not be loaded` : 'Request failed'}</p>
        <p className="mt-0.5 break-words">{error.message}</p>
        {error.field_errors && error.field_errors.length > 0 ? (
          <ul className="mt-1 list-disc pl-5">
            {error.field_errors.map((fe, i) => (
              <li key={`${fe.field}-${i}`}>
                {fe.field ? <span className="font-medium">{fe.field}: </span> : null}
                {fe.message}
              </li>
            ))}
          </ul>
        ) : null}
        {error.detail ? (
          <p className="mt-0.5 break-words text-muted-foreground">{error.detail}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          Error code <span className="tabular-nums">{error.error_code}</span>
          {error.status > 0 ? `, HTTP status ${error.status}` : ''}
        </p>
        {isConfig ? (
          <p className="mt-1 text-muted-foreground">
            Restart the dev server after changing environment variables.
          </p>
        ) : null}
      </div>
      {onRetry && !isConfig ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
