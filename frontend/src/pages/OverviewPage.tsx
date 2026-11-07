import { NotBuilt } from '@/components/NotBuilt';
import { PageHeader } from '@/components/PageHeader';

export function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="What CodePulse is for, how it was evaluated, and how many buggy commits a reviewer finds with a limited review budget."
      />
      <NotBuilt />
    </>
  );
}
