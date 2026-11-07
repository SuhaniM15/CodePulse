import { NotBuilt } from '@/components/NotBuilt';
import { PageHeader } from '@/components/PageHeader';

export function AboutPage() {
  return (
    <>
      <PageHeader
        title="About and limitations"
        description="Intended use, dataset scope and the limits of what CodePulse can tell you."
      />
      <NotBuilt />
    </>
  );
}
