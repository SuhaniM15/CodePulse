import type { ReactNode } from 'react';

import type { ModelStatus } from '@/api/types';
import { Notice } from '@/components/Notice';

interface ProvisionalNoticeProps {
  status: ModelStatus | null | undefined;
  /** What on this page depends on the model, e.g. "These results". */
  subject?: string;
  children?: ReactNode;
  className?: string;
}

/** Renders the "Provisional model" notice only when the model is provisional. */
export function ProvisionalNotice({
  status,
  subject = 'The scores and metrics on this page',
  children,
  className,
}: ProvisionalNoticeProps) {
  if (status !== 'provisional') return null;
  return (
    <Notice variant="provisional" className={className}>
      {children ?? `${subject} come from a provisional model used for integration. They are not final results.`}
    </Notice>
  );
}
