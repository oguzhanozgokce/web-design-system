import { NotFound } from '@/registry/ds/ui/not-found';

export default function NotFoundResource() {
  return (
    <NotFound
      size="md"
      title="This project is no longer here"
      description="It may have been removed or shared with a different account."
      homeHref="#usage"
      labels={{ home: 'View all projects' }}
    />
  );
}
