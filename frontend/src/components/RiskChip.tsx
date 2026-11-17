import type { RiskBand } from '@/api/types';
import { cn } from '@/lib/utils';

const BANDS: Record<RiskBand, { label: string; border: string; dot: string }> = {
  low: { label: 'Low risk', border: 'border-risk-low', dot: 'bg-risk-low' },
  medium: { label: 'Medium risk', border: 'border-risk-medium', dot: 'bg-risk-medium' },
  high: { label: 'High risk', border: 'border-risk-high', dot: 'bg-risk-high' },
};

/**
 * Risk band chip. Always carries a text label, never colour alone. Render it
 * only when the API supplied a band; the frontend never infers one.
 */
export function RiskChip({ band, className }: { band: RiskBand | string; className?: string }) {
  const known = BANDS[band as RiskBand];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border bg-surface px-1.5 py-0.5 text-xs font-medium text-ink',
        known?.border ?? 'border-border',
        className,
      )}
    >
      <span className={cn('size-2 rounded-full', known?.dot ?? 'bg-baseline')} aria-hidden="true" />
      {known?.label ?? `Risk band: ${band}`}
    </span>
  );
}
