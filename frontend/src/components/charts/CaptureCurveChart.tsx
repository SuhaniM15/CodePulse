import { useId } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { CaptureCurveResponse, RankingMethod } from '@/api/types';
import { DataTable, type DataTableColumn } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { FieldList } from '@/components/FieldList';
import { SeriesLegend } from '@/components/charts/series';
import { SERIES, SERIES_ORDER } from '@/components/charts/seriesStyle';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { formatPercentValue } from '@/lib/format';

interface CurveRow {
  pct: number;
  model: number | null;
  change_size: number | null;
  random: number | null;
}

/** Merge the three series by x value. Returns the methods that have no points. */
function buildCurve(data: CaptureCurveResponse): { rows: CurveRow[]; missing: RankingMethod[] } {
  const byPct = new Map<number, CurveRow>();
  const missing: RankingMethod[] = [];
  for (const method of SERIES_ORDER) {
    const series = data.series.find((s) => s.method === method);
    if (!series || !Array.isArray(series.points) || series.points.length === 0) {
      missing.push(method);
      continue;
    }
    for (const p of series.points) {
      const row = byPct.get(p.pct_reviewed) ?? { pct: p.pct_reviewed, model: null, change_size: null, random: null };
      row[method] = p.pct_caught;
      byPct.set(p.pct_reviewed, row);
    }
  }
  return { rows: Array.from(byPct.values()).sort((a, b) => a.pct - b.pct), missing };
}

function describeCurve(rows: CurveRow[]): string {
  const budgets = [10, 20, 30];
  const parts = budgets.flatMap((b) => {
    const row = rows.find((r) => r.pct === b);
    if (!row) return [];
    const values = SERIES_ORDER.map(
      (m) => `${SERIES[m].label} ${row[m] == null ? 'not available' : formatPercentValue(row[m])}`,
    );
    return [`At ${b}% of commits reviewed: ${values.join(', ')}.`];
  });
  return [
    'Line chart. The horizontal axis is the percentage of commits reviewed, from 0 to 100. The vertical axis is the percentage of buggy commits found, from 0 to 100. There are three lines: CodePulse, change-size ranking and random ranking.',
    ...parts,
    'The full data is available in the table below the chart.',
  ].join(' ');
}

const columns: DataTableColumn<CurveRow>[] = [
  { key: 'pct', header: 'Commits reviewed (%)', numeric: true, cell: (r) => formatPercentValue(r.pct) },
  ...SERIES_ORDER.map((m) => ({
    key: m,
    header: `${SERIES[m].label}: buggy commits found (%)`,
    numeric: true,
    cell: (r: CurveRow) => formatPercentValue(r[m]),
  })),
];

export function CaptureCurveChart({ data, title }: { data: CaptureCurveResponse; title: string }) {
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const reduced = usePrefersReducedMotion();
  const { rows, missing } = buildCurve(data);

  if (missing.length > 0) {
    return (
      <EmptyState title="The capture curve is not available">
        The API response has no points for {missing.map((m) => SERIES[m].label).join(', ')}. The curve is shown only when
        CodePulse, change-size ranking and random ranking are all present, so nothing is drawn.
      </EmptyState>
    );
  }

  const descriptionId = `${prefix}-desc`;
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <figure className="m-0 flex flex-col gap-3" aria-labelledby={`${prefix}-title`} aria-describedby={descriptionId}>
      <figcaption id={`${prefix}-title`} className="text-base font-semibold">
        {title}
      </figcaption>
      <SeriesLegend prefix={prefix} kind="line" />
      <p id={descriptionId} className="sr-only">
        {describeCurve(rows)}
      </p>
      <div className="h-[360px] w-full" role="img" aria-labelledby={`${prefix}-title`} aria-describedby={descriptionId}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 12, right: 20, bottom: 32, left: 8 }}>
            <CartesianGrid stroke="var(--cp-border)" />
            <XAxis
              type="number"
              dataKey="pct"
              domain={[0, 100]}
              ticks={ticks}
              tickFormatter={(v: number) => `${v}%`}
              label={{ value: 'Percentage of commits reviewed', position: 'insideBottom', offset: -22 }}
            />
            <YAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              label={{
                value: 'Percentage of buggy commits found',
                angle: -90,
                position: 'insideLeft',
                offset: 4,
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              labelFormatter={(v) => `${v}% of commits reviewed`}
              formatter={(value) => (typeof value === 'number' ? formatPercentValue(value) : '')}
            />
            {SERIES_ORDER.map((method) => (
              <Line
                key={method}
                type="linear"
                dataKey={method}
                name={SERIES[method].label}
                stroke={SERIES[method].color}
                strokeWidth={method === 'model' ? 3 : 2.5}
                strokeDasharray={SERIES[method].dash}
                dot={false}
                connectNulls
                isAnimationActive={!reduced}
                animationDuration={900}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <FieldList
        className="lg:grid-cols-3"
        items={[
          { label: 'Step between points', value: formatPercentValue(data.step_pct) },
          { label: 'Random ranking method', value: <span className="font-normal">{data.random_method}</span> },
          { label: 'Tie policy', value: <span className="font-normal">{data.tie_policy}</span> },
        ]}
      />

      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Show the chart data as a table</summary>
        <div className="mt-3 max-h-80 overflow-auto">
          <DataTable
            caption="Capture curve data"
            columns={columns}
            rows={rows}
            getRowId={(r) => String(r.pct)}
          />
        </div>
      </details>
    </figure>
  );
}
