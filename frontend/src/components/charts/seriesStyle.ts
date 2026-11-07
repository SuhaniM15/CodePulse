import type { RankingMethod } from '@/api/types';

/**
 * One definition of how each ranking method looks. Methods differ by pattern
 * (bars) and dash (lines), never by colour alone.
 */
export const SERIES_ORDER: RankingMethod[] = ['model', 'change_size', 'random'];

export interface SeriesStyle {
  label: string;
  color: string;
  /** Line dash pattern; undefined means solid. */
  dash: string | undefined;
  /** Bar fill pattern. */
  pattern: 'solid' | 'hatch' | 'dots';
}

export const SERIES: Record<RankingMethod, SeriesStyle> = {
  model: { label: 'CodePulse', color: 'var(--cp-model)', dash: undefined, pattern: 'solid' },
  change_size: {
    label: 'Change-size ranking',
    color: 'var(--cp-change-size)',
    dash: '8 4',
    pattern: 'hatch',
  },
  random: { label: 'Random ranking', color: 'var(--cp-baseline)', dash: '2 4', pattern: 'dots' },
};

export function patternId(prefix: string, method: RankingMethod): string {
  return `${prefix}-${method}`;
}

/** Bar fill for a method; use as fill={barFill(prefix, method)}. */
export function barFill(prefix: string, method: RankingMethod): string {
  return SERIES[method].pattern === 'solid' ? SERIES[method].color : `url(#${patternId(prefix, method)})`;
}
