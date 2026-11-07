import { ButtonLink } from '@/registry/ds/ui/button';
import { NotFound } from '@/registry/ds/ui/not-found';

export default function NotFoundDemo() {
  return (
    <NotFound
      homeHref="/"
      secondaryAction={
        <ButtonLink href="/docs" variant="soft">
          Browse components
        </ButtonLink>
      }
    />
  );
}
