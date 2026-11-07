import type { ReactNode } from 'react';
import { FlaskConical, History, Info } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * The one notice component. Variants:
 *  - sample:        fixture data is on screen (always non-dismissible)
 *  - provisional:   the model is provisional
 *  - retrospective: results are historical replay, not live analysis
 *
 * Notices cannot be dismissed. Their colours are the only place the amber,
 * light-blue and slate notice tokens are used.
 */
export type NoticeVariant = 'sample' | 'provisional' | 'retrospective';

const VARIANTS: Record<
  NoticeVariant,
  { title: string; icon: typeof Info; className: string }
> = {
  sample: {
    title: 'Sample data',
    icon: FlaskConical,
    className:
      'border-[var(--cp-notice-sample-border)] bg-[var(--cp-notice-sample-bg)] text-[var(--cp-notice-sample-text)]',
  },
  provisional: {
    title: 'Provisional model',
    icon: Info,
    className:
      'border-[var(--cp-notice-provisional-border)] bg-[var(--cp-notice-provisional-bg)] text-[var(--cp-notice-provisional-text)]',
  },
  retrospective: {
    title: 'Retrospective results',
    icon: History,
    className:
      'border-[var(--cp-notice-retro-border)] bg-[var(--cp-notice-retro-bg)] text-[var(--cp-notice-retro-text)]',
  },
};

interface NoticeProps {
  variant: NoticeVariant;
  /** Overrides the default heading for the variant. */
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Notice({ variant, title, children, className }: NoticeProps) {
  const { title: defaultTitle, icon: Icon, className: tone } = VARIANTS[variant];

  return (
    <div
      role="note"
      data-notice={variant}
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed',
        tone,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title ?? defaultTitle}</p>
        {children ? <div className="mt-0.5">{children}</div> : null}
      </div>
    </div>
  );
}
