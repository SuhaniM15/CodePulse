import { NotBuilt } from '@/components/NotBuilt';
import { PageHeader } from '@/components/PageHeader';

export function CommitRankingPage() {
  return (
    <>
      <PageHeader
        title="Commit ranking"
        description="Historical commits ranked by risk score, with the recorded historical outcome."
      />
      <NotBuilt />
    </>
  );
}
