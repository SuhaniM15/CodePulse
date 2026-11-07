// ─────────────────────────────────────────────────────────────────────────────
// CodePulse — central API client
//
// Reads two environment variables:
//   VITE_API_BASE_URL  — base URL for the FastAPI backend
//   VITE_USE_MOCK      — "true" to use fixture data (development mode only)
//
// Rules:
//   - isMockMode() === true  → all calls return mock fixtures; never real API
//   - isMockMode() === false → all calls hit the real API; failures surface as
//     ApiError; never fall back silently to mock data
// ─────────────────────────────────────────────────────────────────────────────

import type { ApiError } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK === 'true';
}

function buildApiError(status: number, body: unknown): ApiError {
  if (
    body !== null &&
    typeof body === 'object' &&
    'error_code' in body &&
    'message' in body
  ) {
    return {
      error_code: String((body as Record<string, unknown>).error_code),
      message: String((body as Record<string, unknown>).message),
      detail: (body as Record<string, unknown>).detail
        ? String((body as Record<string, unknown>).detail)
        : undefined,
      status,
    };
  }

  // Unstructured error — surface HTTP status directly
  return {
    error_code: `HTTP_${status}`,
    message: `The server returned an unexpected error (HTTP ${status}). Check that the backend is running at ${API_BASE}.`,
    status,
  };
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...options,
    });
  } catch (networkErr) {
    throw {
      error_code: 'NETWORK_ERROR',
      message: `Cannot reach the backend at ${API_BASE}. Check that it is running and that VITE_API_BASE_URL is set correctly.`,
      detail: String(networkErr),
      status: 0,
    } satisfies ApiError;
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // non-JSON body — handled by buildApiError
    }
    throw buildApiError(response.status, body);
  }

  return response.json() as Promise<T>;
}
