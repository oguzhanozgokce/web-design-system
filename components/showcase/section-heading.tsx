import type { ReactNode } from 'react';
import { cn } from '@/registry/ds/lib/utils';

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
    <div className={cn('flex flex-col gap-5', className)}>
      <p className="font-mono text-xs tracking-wide text-on-surface-variant">{eyebrow}</p>
      <div className="grid items-end gap-5 md:grid-cols-[1.5fr_1fr] md:gap-12">
        <h2 className="max-w-xl text-4xl leading-[1.1] font-medium tracking-[-0.04em] text-balance sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-pretty text-on-surface-variant sm:text-base">
          {body}
        </p>
      </div>
    </div>
  );
}
