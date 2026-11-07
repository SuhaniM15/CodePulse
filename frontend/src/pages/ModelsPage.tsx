import { NotBuilt } from '@/components/NotBuilt';
import { PageHeader } from '@/components/PageHeader';

export function ModelsPage() {
  return (
    <>
      <PageHeader
        title="Models"
        description="Comparison of the evaluated models on the evaluation split."
      />
      <NotBuilt />
    </>
  );
}
