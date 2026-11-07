// ─────────────────────────────────────────────────────────────────────────────
// CodePulse: central API client
//
// Environment variables:
//   VITE_API_BASE_URL  base URL of the backend. No default: if it is unset and
//                      mock mode is off, requests fail with CONFIG_ERROR.
//   VITE_USE_MOCK      "true" enables fixture data. Any other value disables it.
//
// Rules:
//   - Mock mode is decided here (isMockMode) and enforced in useApi. This file
//     never imports mock data, and mock files never import this file.
//   - With mock mode off, every failure surfaces as an ApiError. There is no
//     silent fallback to fixtures.
// ─────────────────────────────────────────────────────────────────────────────

import type { ApiError, ApiFieldError } from './types';

export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK === 'true';
}

/** The configured API base URL, or null when VITE_API_BASE_URL is unset/blank. */
export function getApiBase(): string | null {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed === '' ? null : trimmed;
}

export const CONFIG_ERROR_CODE = 'CONFIG_ERROR';

export function configError(): ApiError {
  return {
    error_code: CONFIG_ERROR_CODE,
    message:
      'The API address is not configured. Set VITE_API_BASE_URL in frontend/.env (see .env.example), or set VITE_USE_MOCK=true to use sample data.',
    status: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Turn a FastAPI 422 `detail` list into per-field errors. */
function parseValidationList(detail: unknown[]): ApiFieldError[] {
  const out: ApiFieldError[] = [];
  for (const item of detail) {
    if (!isRecord(item)) continue;
    const msg = typeof item.msg === 'string' ? item.msg : null;
    if (msg === null) continue;
    const loc = Array.isArray(item.loc) ? item.loc : [];
    const last = loc.length > 0 ? loc[loc.length - 1] : '';
    out.push({ field: String(last), message: msg });
  }
  return out;
}

/**
 * Accepts, in order:
 *   1. { error_code, message, detail? }
 *   2. FastAPI { detail: string }
 *   3. FastAPI 422 { detail: [{ loc, msg, type }, ...] }
 *   4. { message }
 * and shows the API's own text. Falls back to the HTTP status only when the
 * body carries no message.
 */
export function buildApiError(status: number, body: unknown): ApiError {
  if (isRecord(body)) {
    const { error_code, message, detail } = body;

    if (typeof message === 'string' && message !== '') {
      return {
        error_code: typeof error_code === 'string' ? error_code : `HTTP_${status}`,
        message,
        detail: typeof detail === 'string' ? detail : undefined,
        status,
      };
    }

    if (typeof detail === 'string' && detail !== '') {
      return {
        error_code: typeof error_code === 'string' ? error_code : `HTTP_${status}`,
        message: detail,
        status,
      };
    }

    if (Array.isArray(detail)) {
      const field_errors = parseValidationList(detail);
      if (field_errors.length > 0) {
        return {
          error_code: typeof error_code === 'string' ? error_code : `HTTP_${status}`,
          message: field_errors
            .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
            .join('; '),
          field_errors,
          status,
        };
      }
    }
  }

  return {
    error_code: `HTTP_${status}`,
    message: `The API responded with HTTP ${status} and no error message.`,
    status,
  };
}

export interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

export function buildQuery(params?: QueryParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs === '' ? '' : `?${qs}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = getApiBase();
  if (base === null) throw configError();

  const { method = 'GET', body, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    if (networkErr instanceof DOMException && networkErr.name === 'AbortError') {
      throw networkErr;
    }
    // The only place we point at the backend address: nothing answered.
    throw {
      error_code: 'NETWORK_ERROR',
      message: `Cannot reach the API at ${base}. Check that it is running and that VITE_API_BASE_URL is correct.`,
      detail: String(networkErr),
      status: 0,
    } satisfies ApiError;
  }

  if (!response.ok) {
    let errBody: unknown = null;
    try {
      errBody = await response.json();
    } catch {
      // Non-JSON error body: buildApiError falls back to the HTTP status.
    }
    throw buildApiError(response.status, errBody);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw {
      error_code: 'PARSE_ERROR',
      message: 'The API responded successfully but the body was not valid JSON.',
      status: response.status,
    } satisfies ApiError;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value.error_code === 'string' &&
    typeof value.message === 'string' &&
    typeof value.status === 'number'
  );
}

/** Normalise anything thrown into an ApiError. */
export function toApiError(err: unknown): ApiError {
  if (isApiError(err)) return err;
  return {
    error_code: 'UNKNOWN_ERROR',
    message: err instanceof Error ? err.message : 'An unexpected error occurred.',
    status: 0,
  };
}
