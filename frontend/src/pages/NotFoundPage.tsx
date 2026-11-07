import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';
import { buttonVariants } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" description="There is no page at this address." />
      <Link to="/" className={buttonVariants({ variant: 'outline' })}>
        Go to the overview
      </Link>
    </>
  );
}
