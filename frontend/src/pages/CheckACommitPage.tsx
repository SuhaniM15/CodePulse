import { NotBuilt } from '@/components/NotBuilt';
import { PageHeader } from '@/components/PageHeader';

export function CheckACommitPage() {
  return (
    <>
      <PageHeader
        title="Check a commit"
        description="Enter commit metrics to get a model score, and see which features matter to the model overall."
      />
      <NotBuilt />
    </>
  );
}
