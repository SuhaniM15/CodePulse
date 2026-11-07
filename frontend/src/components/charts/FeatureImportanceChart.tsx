import { useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { FeatureImportanceResponse } from '@/api/types';
import { DataTable } from '@/components/DataTable';
import { formatMetric } from '@/lib/format';

/** Global feature importance: magnitude only, no direction. */
export function FeatureImportanceChart({ data, title }: { data: FeatureImportanceResponse; title: string }) {
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rows = [...data.features].sort((a, b) => b.importance - a.importance);
  const descriptionId = `${prefix}-desc`;
  const description =
    'Horizontal bar chart of global feature importance, as a magnitude. Features are listed from largest to smallest: ' +
    rows.map((r) => `${r.feature} ${formatMetric(r.importance)}`).join(', ') +
    '.';

  return (
    <figure className="m-0 flex flex-col gap-3" aria-labelledby={`${prefix}-title`} aria-describedby={descriptionId}>
      <figcaption id={`${prefix}-title`} className="text-base font-semibold">
        {title}
      </figcaption>
      <p id={descriptionId} className="sr-only">
        {description}
      </p>
      <div
        className="w-full"
        style={{ height: Math.max(220, rows.length * 30 + 70) }}
        role="img"
        aria-labelledby={`${prefix}-title`}
        aria-describedby={descriptionId}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 48, bottom: 32, left: 8 }}>
            <CartesianGrid horizontal={false} stroke="var(--cp-border)" />
            <XAxis
              type="number"
              domain={[0, 'auto']}
              tickFormatter={(v: number) => formatMetric(v)}
              label={{ value: 'Importance (magnitude)', position: 'insideBottom', offset: -22 }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={64}
              tickLine={false}
              label={{ value: 'Feature code', angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle' } }}
            />
            <Tooltip
              cursor={{ fill: 'var(--cp-canvas)' }}
              formatter={(value) => (typeof value === 'number' ? formatMetric(value) : '')}
            />
            <Bar
              dataKey="importance"
              name="Importance (magnitude)"
              fill="var(--cp-model)"
              isAnimationActive={false}
              maxBarSize={18}
            >
              <LabelList
                dataKey="importance"
                position="right"
                formatter={(v: unknown) => (typeof v === 'number' ? formatMetric(v) : '')}
                style={{ fontSize: 11, fill: 'var(--cp-ink)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Show the importance values as a table</summary>
        <div className="mt-3">
          <DataTable
            caption="Global feature importance"
            columns={[
              { key: 'feature', header: 'Feature code', cell: (r) => r.feature },
              { key: 'importance', header: 'Importance (magnitude)', numeric: true, cell: (r) => formatMetric(r.importance) },
            ]}
            rows={rows}
            getRowId={(r) => r.feature}
          />
        </div>
      </details>
    </figure>
  );
}
