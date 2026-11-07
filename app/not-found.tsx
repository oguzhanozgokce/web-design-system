import type { Metadata } from 'next';
import { ButtonLink } from '@/registry/ds/ui/button';
import { NotFound } from '@/registry/ds/ui/not-found';

export const metadata: Metadata = {
  title: 'Page not found',
  description:
    'This page could not be found. Browse the component catalogue to find your way back.',
  robots: { index: false },
};

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center bg-canvas text-on-surface">
      <NotFound
        headingLevel={1}
        homeHref="/"
        secondaryAction={
          <ButtonLink href="/docs" variant="soft">
            Browse components
          </ButtonLink>
        }
      />
    </main>
  );
}
