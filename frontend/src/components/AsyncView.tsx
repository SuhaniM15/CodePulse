import type { ReactNode } from 'react';

import type { AsyncState } from '@/api/types';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';

interface AsyncViewProps<T> {
  state: AsyncState<T>;
  reload: () => void;
  /** What is being loaded, e.g. "Review budget results". */
  what: string;
  /** Return true when the response is valid but has nothing to show. */
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  children: (data: T) => ReactNode;
}

/** Loading, API-error (including 422 field errors), empty and success in one place. */
export function AsyncView<T>({
  state,
  reload,
  what,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children,
}: AsyncViewProps<T>) {
  if (state.status === 'loading') return <LoadingState what={what} />;
  if (state.status === 'error') {
    return <ErrorState title={what} error={state.error} onRetry={reload} />;
  }
  if (isEmpty?.(state.data)) {
    return (
      <EmptyState title={emptyTitle ?? `No ${what.toLowerCase()} to show`}>
        {emptyDescription ?? 'The API responded, but the response contained no data for this view.'}
      </EmptyState>
    );
  }
  return <>{children(state.data)}</>;
}
