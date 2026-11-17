// useApi: the only place that decides between the real API and fixtures.
//
//  - VITE_USE_MOCK=true  -> returns the supplied fixture (isMock: true) and
//                           never calls the API.
//  - otherwise           -> calls the API. Any failure is returned as an error
//                           state. It is never replaced by fixture data.
//  - Mock mode with no fixture supplied is an error, not an empty success.

import { useEffect, useState } from 'react';

import {
  apiFetch,
  buildQuery,
  configError,
  getApiBase,
  isMockMode,
  toApiError,
  type QueryParams,
} from '@/api/client';
import type { ApiError, AsyncState } from '@/api/types';
import { registerFixtureUse } from '@/hooks/fixtureRegistry';

export interface UseApiOptions<T> {
  params?: QueryParams;
  /** Fixture returned when VITE_USE_MOCK=true. Ignored otherwise. Pass a
   *  module-level constant so its identity is stable across renders. */
  mock?: T;
  /** Set false to skip the request (for example while a form is incomplete). */
  enabled?: boolean;
}

export interface UseApiResult<T> {
  state: AsyncState<T>;
  /** Re-run the request (recovery action for error states). */
  reload: () => void;
}

type Settled<T> = Exclude<AsyncState<T>, { status: 'loading' }>;

const LOADING = { status: 'loading' } as const;

function resolveMock<T>(path: string, mock: T | undefined): Settled<T> {
  if (mock === undefined) {
    const error: ApiError = {
      error_code: 'MOCK_FIXTURE_MISSING',
      message: `Mock mode is on (VITE_USE_MOCK=true) but there is no sample fixture for ${path}.`,
      status: 0,
    };
    return { status: 'error', error };
  }
  return { status: 'success', data: mock, isMock: true };
}

export function useApi<T>(
  path: string,
  { params, mock, enabled = true }: UseApiOptions<T> = {},
): UseApiResult<T> {
  const mockMode = isMockMode();
  const query = buildQuery(params);
  const [nonce, setNonce] = useState(0);
  const [fetched, setFetched] = useState<{ key: string; state: Settled<T> } | null>(
    null,
  );

  const key = `${path}${query}#${nonce}`;

  // Fixture state is derived during render: no effect, no flash of loading.
  const mockState = mockMode && enabled ? resolveMock(path, mock) : null;

  // Tell the layout a fixture is on screen so it can show the "Sample data" notice.
  const showingFixture = mockState?.status === 'success';
  useEffect(() => {
    if (!showingFixture) return;
    return registerFixtureUse(Symbol(path), path);
  }, [showingFixture, path]);

  // Real API request. Never runs in mock mode.
  useEffect(() => {
    if (mockMode || !enabled || getApiBase() === null) return;

    const controller = new AbortController();
    apiFetch<T>(`${path}${query}`, { signal: controller.signal }).then(
      (data) => setFetched({ key, state: { status: 'success', data, isMock: false } }),
      (err: unknown) => {
        if (controller.signal.aborted) return;
        setFetched({ key, state: { status: 'error', error: toApiError(err) } });
      },
    );
    return () => controller.abort();
  }, [mockMode, enabled, path, query, key]);

  const reload = () => setNonce((n) => n + 1);

  if (!enabled) return { state: LOADING, reload };
  if (mockState !== null) return { state: mockState, reload };
  if (getApiBase() === null) {
    return { state: { status: 'error', error: configError() }, reload };
  }
  return {
    state: fetched !== null && fetched.key === key ? fetched.state : LOADING,
    reload,
  };
}
