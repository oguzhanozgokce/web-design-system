import type { ReactNode } from 'react';
import { cn } from '@/registry/ds/lib/utils';
import { Reveal } from '@/components/showcase/reveal';

export function SectionHeading({
  eyebrow,
  title,
  body,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn('flex max-w-3xl flex-col gap-3', className)}>
      <p className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant">
        <span aria-hidden className="size-1.5 rounded-full bg-primary-solid" />
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-balance text-on-surface sm:text-4xl">
        {title}
      </h2>
      <p className="text-base text-pretty text-on-surface-variant sm:text-lg">{body}</p>
    </Reveal>
  );
}
