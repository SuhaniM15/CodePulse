import { NotBuilt } from '@/components/NotBuilt';
import { PageHeader } from '@/components/PageHeader';

export function ReviewBudgetPage() {
  return (
    <>
      <PageHeader
        title="Review budget"
        description="How many buggy commits are found when only the top share of commits is reviewed, compared with random and change-size ranking."
      />
      <NotBuilt />
    </>
  );
}
