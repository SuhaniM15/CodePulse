// POST /predict. Mirrors useApi's rules:
//  - VITE_USE_MOCK=true: returns the sample fixture and never calls the API.
//  - otherwise: calls the API; any failure is an error state, never a fixture.
//  - A response without a numeric risk_score is an error, never a shown score.

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiFetch, configError, getApiBase, isMockMode, toApiError } from '@/api/client';
import type { ApiError, PredictRequest, PredictResponse } from '@/api/types';
import { registerFixtureUse } from '@/hooks/fixtureRegistry';
import { mockPredictResponse } from '@/mocks/predict.mock';

export type PredictState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: PredictResponse; isMock: boolean }
  | { status: 'error'; error: ApiError };

export function usePredict() {
  const [state, setState] = useState<PredictState>({ status: 'idle' });
  const lastRequest = useRef<PredictRequest | null>(null);
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(async (request: PredictRequest) => {
    lastRequest.current = request;
    controller.current?.abort();

    if (isMockMode()) {
      setState({ status: 'success', data: mockPredictResponse, isMock: true });
      return;
    }
    if (getApiBase() === null) {
      setState({ status: 'error', error: configError() });
      return;
    }

    const ctrl = new AbortController();
    controller.current = ctrl;
    setState({ status: 'loading' });
    try {
      const data = await apiFetch<PredictResponse>('/predict', {
        method: 'POST',
        body: request,
        signal: ctrl.signal,
      });
      if (typeof data?.risk_score !== 'number' || !Number.isFinite(data.risk_score)) {
        setState({
          status: 'error',
          error: {
            error_code: 'INVALID_RESPONSE',
            message: 'The API responded, but the response had no valid risk score, so no score is shown.',
            status: 200,
          },
        });
        return;
      }
      setState({ status: 'success', data, isMock: false });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setState({ status: 'error', error: toApiError(err) });
    }
  }, []);

  const retry = useCallback(() => {
    if (lastRequest.current) void submit(lastRequest.current);
  }, [submit]);

  const reset = useCallback(() => {
    controller.current?.abort();
    lastRequest.current = null;
    setState({ status: 'idle' });
  }, []);

  const showingFixture = state.status === 'success' && state.isMock;
  useEffect(() => {
    if (!showingFixture) return;
    return registerFixtureUse(Symbol('/predict'), '/predict');
  }, [showingFixture]);

  useEffect(() => () => controller.current?.abort(), []);

  return { state, submit, retry, reset };
}
