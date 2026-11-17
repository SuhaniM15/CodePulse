import type { BudgetPct, ProjectBudgetResult, ViewMode } from '@/api/types';
import { SERIES, SERIES_ORDER } from '@/components/charts/seriesStyle';
import { formatPercentValue } from '@/lib/format';

/** A budget result, with `project` present in the per-project view. */
export type BudgetRow = Omit<ProjectBudgetResult, 'project'> & { project?: string };

export interface ChartRow {
  name: string;
  budget?: BudgetPct;
  model: number | null;
  change_size: number | null;
  random: number | null;
}

function rateToPercent(rate: number | null | undefined): number | null {
  return rate == null ? null : rate * 100;
}

export function buildRows(view: ViewMode, selected: BudgetPct, results: BudgetRow[]): ChartRow[] {
  const empty = (name: string, budget?: BudgetPct): ChartRow => ({
    name,
    budget,
    model: null,
    change_size: null,
    random: null,
  });

  if (view === 'pooled') {
    const budgets = Array.from(new Set(results.map((r) => r.budget_pct))).sort((a, b) => a - b);
    return budgets.map((budget) => {
      const row = empty(`Top ${budget}%`, budget);
      for (const r of results) {
        if (r.budget_pct === budget) row[r.method] = rateToPercent(r.capture_rate);
      }
      return row;
    });
  }

  const byProject = new Map<string, ChartRow>();
  for (const r of results) {
    if (r.budget_pct !== selected || r.project === undefined) continue;
    const row = byProject.get(r.project) ?? empty(r.project);
    row[r.method] = rateToPercent(r.capture_rate);
    byProject.set(r.project, row);
  }
  return Array.from(byProject.values());
}

/** Text alternative for the chart, generated from the same API values. */
export function describeChart(view: ViewMode, selected: BudgetPct, results: BudgetRow[]): string {
  const rows = buildRows(view, selected, results);
  if (rows.length === 0) return 'The chart has no data.';
  const intro =
    view === 'pooled'
      ? 'Grouped bar chart of the percentage of buggy commits found at each review budget, for all projects pooled.'
      : `Grouped bar chart of the percentage of buggy commits found in the top ${selected}% of commits, one group per project.`;
  const body = rows
    .map((row) => {
      const parts = SERIES_ORDER.map(
        (m) => `${SERIES[m].label} ${row[m] == null ? 'not available' : formatPercentValue(row[m])}`,
      );
      return `${row.name}: ${parts.join(', ')}.`;
    })
    .join(' ');
  return `${intro} ${body}`;
}
