import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface FieldItem {
  label: string;
  value: ReactNode;
}

/** Separately labelled values. Never joins fields with separators. */
export function FieldList({ items, className }: { items: FieldItem[]; className?: string }) {
  return (
    <dl className={cn('m-0 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="m-0 text-base font-medium tabular-nums break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
