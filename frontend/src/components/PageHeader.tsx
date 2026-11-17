import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="m-0 text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-1.5 max-w-prose text-base text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
