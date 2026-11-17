// Display formatting only. These functions never create values; null and
// undefined become "N/A".

export const NOT_AVAILABLE = 'N/A';

const intFormat = new Intl.NumberFormat('en-GB');
const metricFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 3 });
const percentFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

export function formatInt(value: number | null | undefined): string {
  return value == null ? NOT_AVAILABLE : intFormat.format(value);
}

export function formatMetric(value: number | null | undefined): string {
  return value == null ? NOT_AVAILABLE : metricFormat.format(value);
}

/** A percentage already on a 0 to 100 scale. */
export function formatPercentValue(value: number | null | undefined): string {
  return value == null ? NOT_AVAILABLE : `${percentFormat.format(value)}%`;
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const DATE_RANGE_UNAVAILABLE = 'Not available';

/** Parses an ISO 8601 date (YYYY-MM-DD, optionally followed by a time). Anything else is null. */
function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:$|[T\s])/.test(value)) return null;
  const day = value.slice(0, 10);
  const date = new Date(`${day}T00:00:00Z`);
  // Reject impossible dates such as 2000-13-45, which Date would reject or roll over.
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day ? null : date;
}

/**
 * Formats an evaluation date range as "1 Jan 2000 to 31 Dec 2000".
 * A missing range, a missing or non-ISO endpoint (including a zero timestamp,
 * which must not become January 1970), an unparseable date, or an end before
 * the start all give "Not available".
 */
export function formatDateRange(range: { start?: unknown; end?: unknown } | null | undefined): string {
  const start = parseIsoDate(range?.start);
  const end = parseIsoDate(range?.end);
  if (!start || !end || end < start) return DATE_RANGE_UNAVAILABLE;
  return `${dateFormat.format(start)} to ${dateFormat.format(end)}`;
}

/** A fraction from 0 to 1, shown as a percentage. */
export function formatFraction(value: number | null | undefined): string {
  return value == null ? NOT_AVAILABLE : formatPercentValue(value * 100);
}
