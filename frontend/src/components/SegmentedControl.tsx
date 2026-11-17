import { useId } from 'react';

import { cn } from '@/lib/utils';

export interface SegmentOption<V extends string | number> {
  value: V;
  label: string;
}

interface SegmentedControlProps<V extends string | number> {
  /** Accessible name for the group. */
  label: string;
  options: SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
}

/** Native radio inputs, so arrow keys and focus behave as users expect. */
export function SegmentedControl<V extends string | number>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<V>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-border bg-surface p-0.5">
      {options.map((option) => (
        <label key={String(option.value)} className="relative cursor-pointer">
          <input
            type="radio"
            name={name}
            value={String(option.value)}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
          />
          <span
            className={cn(
              'block rounded-[3px] px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors',
              'hover:text-ink peer-checked:bg-primary peer-checked:text-primary-foreground',
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--cp-focus)]',
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
