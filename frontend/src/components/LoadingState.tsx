interface LoadingStateProps {
  /** What is loading, e.g. "Review budget results". */
  what: string;
}

export function LoadingState({ what }: LoadingStateProps) {
  return (
    <p
      role="status"
      className="rounded-lg border border-border bg-surface px-4 py-6 text-sm text-muted-foreground"
    >
      Loading {what.toLowerCase()}
    </p>
  );
}
