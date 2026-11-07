import { useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { BudgetPct, RankingMethod, ViewMode } from '@/api/types';
import { buildRows, type BudgetRow } from '@/components/charts/budgetChartData';
import { SeriesLegend, SeriesPatterns } from '@/components/charts/series';
import { barFill, SERIES, SERIES_ORDER } from '@/components/charts/seriesStyle';
import { formatPercentValue, NOT_AVAILABLE } from '@/lib/format';

interface ReviewBudgetChartProps {
  view: ViewMode;
  selected: BudgetPct;
  results: BudgetRow[];
  title: string;
  /** id of an element holding the text alternative. */
  descriptionId: string;
}

export function ReviewBudgetChart({ view, selected, results, title, descriptionId }: ReviewBudgetChartProps) {
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rows = buildRows(view, selected, results);
  const xLabel = view === 'pooled' ? 'Share of commits reviewed' : 'Project';

  return (
    <figure className="m-0 flex flex-col gap-3" aria-labelledby={`${prefix}-title`} aria-describedby={descriptionId}>
      <figcaption id={`${prefix}-title`} className="text-base font-semibold">
        {title}
      </figcaption>
      <SeriesLegend prefix={prefix} kind="bar" />
      <div className="h-[340px] w-full" role="img" aria-labelledby={`${prefix}-title`} aria-describedby={descriptionId}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 20, right: 16, bottom: 32, left: 8 }} barGap={4}>
            <SeriesPatterns prefix={prefix} />
            <CartesianGrid vertical={false} stroke="var(--cp-border)" />
            <XAxis
              dataKey="name"
              tickLine={false}
              label={{ value: xLabel, position: 'insideBottom', offset: -22 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              label={{
                value: 'Buggy commits found (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 4,
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              cursor={{ fill: 'var(--cp-canvas)' }}
              formatter={(value) => (typeof value === 'number' ? formatPercentValue(value) : NOT_AVAILABLE)}
            />
            {SERIES_ORDER.map((method: RankingMethod) => (
              <Bar
                key={method}
                dataKey={method}
                name={SERIES[method].label}
                fill={barFill(prefix, method)}
                stroke={SERIES[method].color}
                strokeWidth={1.5}
                isAnimationActive={false}
                maxBarSize={44}
              >
                {rows.map((row) => (
                  <Cell
                    key={row.name}
                    fillOpacity={view === 'pooled' && row.budget !== selected ? 0.4 : 1}
                    strokeOpacity={view === 'pooled' && row.budget !== selected ? 0.4 : 1}
                  />
                ))}
                <LabelList
                  dataKey={method}
                  position="top"
                  formatter={(v: unknown) => (typeof v === 'number' ? formatPercentValue(v) : '')}
                  style={{ fontSize: 11, fill: 'var(--cp-ink)' }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
