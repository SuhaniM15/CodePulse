import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  /** Say what is missing and why nothing is shown. Never a placeholder. */
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <section
      aria-label={title}
      className="rounded-lg border border-dashed border-border bg-surface px-5 py-6 text-sm"
    >
      <p className="m-0 font-semibold">{title}</p>
      {children ? <div className="mt-1 max-w-prose text-muted-foreground">{children}</div> : null}
    </section>
  );
}
