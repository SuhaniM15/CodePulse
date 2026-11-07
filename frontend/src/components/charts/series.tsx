import { barFill, patternId, SERIES, SERIES_ORDER } from '@/components/charts/seriesStyle';

/** SVG <defs> with the hatch and dot patterns. Render inside an <svg>. */
export function SeriesPatterns({ prefix }: { prefix: string }) {
  return (
    <defs>
      <pattern
        id={patternId(prefix, 'change_size')}
        patternUnits="userSpaceOnUse"
        width="7"
        height="7"
        patternTransform="rotate(45)"
      >
        <rect width="7" height="7" fill="#FFFFFF" />
        <line x1="0" y1="0" x2="0" y2="7" stroke={SERIES.change_size.color} strokeWidth="3.5" />
      </pattern>
      <pattern id={patternId(prefix, 'random')} patternUnits="userSpaceOnUse" width="7" height="7">
        <rect width="7" height="7" fill="#FFFFFF" />
        <circle cx="3.5" cy="3.5" r="1.6" fill={SERIES.random.color} />
      </pattern>
    </defs>
  );
}

/** Legend whose swatches repeat each series' bar pattern or line dash. */
export function SeriesLegend({ prefix, kind }: { prefix: string; kind: 'bar' | 'line' }) {
  const legendPrefix = `${prefix}-legend`;
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-sm" aria-label="Legend">
      {SERIES_ORDER.map((method) => {
        const s = SERIES[method];
        return (
          <li key={method} className="flex items-center gap-2">
            <svg width="30" height="14" aria-hidden="true" focusable="false">
              <SeriesPatterns prefix={legendPrefix} />
              {kind === 'bar' ? (
                <rect
                  x="1"
                  y="1"
                  width="28"
                  height="12"
                  fill={barFill(legendPrefix, method)}
                  stroke={s.color}
                  strokeWidth="1.5"
                />
              ) : (
                <line
                  x1="1"
                  y1="7"
                  x2="29"
                  y2="7"
                  stroke={s.color}
                  strokeWidth={method === 'model' ? 3 : 2.5}
                  strokeDasharray={s.dash}
                  strokeLinecap="round"
                />
              )}
            </svg>
            {s.label}
          </li>
        );
      })}
    </ul>
  );
}
