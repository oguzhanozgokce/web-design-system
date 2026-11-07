'use client';

import { motion } from 'motion/react';
import { fluidTween } from '@/registry/ds/lib/motion';
import { tv } from '@/registry/ds/lib/utils';
import { ButtonLink } from '@/registry/ds/ui/button';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { EmptyState, type EmptyStateProps } from '@/registry/ds/ui/empty-state';

export interface NotFoundLabels {
  title: string;
  description: string;
  home: string;
}

export const defaultNotFoundLabels: NotFoundLabels = {
  title: 'This page took a different path',
  description:
    'The page may have moved, or the link may be out of date. Let’s get you somewhere familiar.',
  home: 'Go home',
};

export const notFoundStyles = tv({
  slots: {
    root: '',
    illustration:
      'relative flex h-full w-72 max-w-full items-center justify-center gap-3 select-none',
    digit: 'text-[7rem] leading-none font-semibold tracking-tighter text-neutral-soft-hover',
    page: 'relative flex h-28 w-20 -rotate-6 flex-col items-center justify-center gap-3 rounded-container border border-outline-subtle bg-surface-raised text-primary shadow-sm',
    line: 'h-1.5 w-8 rounded-full bg-neutral-soft-hover',
    orbit: 'absolute inset-x-4 bottom-2 h-4 rounded-full bg-neutral-soft blur-sm',
  },
});

export interface NotFoundProps extends Omit<
  EmptyStateProps,
  'title' | 'description' | 'illustration' | 'icon'
> {
  title?: EmptyStateProps['title'];
  description?: EmptyStateProps['description'];
  homeHref?: string;
  labels?: Partial<NotFoundLabels>;
}

export function NotFound({
  title,
  description,
  homeHref,
  primaryAction,
  labels,
  size = 'lg',
  className,
  ...props
}: NotFoundProps) {
  const t = useLabels('notFound', defaultNotFoundLabels, labels);
  const icons = useIcons();
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  const styles = notFoundStyles();
  return (
    <EmptyState
      {...props}
      data-component="not-found"
      size={size}
      className={styles.root({ className })}
      title={title ?? t.title}
      description={description ?? t.description}
      primaryAction={
        primaryAction ??
        (homeHref ? (
          <ButtonLink href={homeHref} startIcon={<icons.arrowBack className="rtl:-scale-x-100" />}>
            {t.home}
          </ButtonLink>
        ) : undefined)
      }
      illustration={
        <div className={styles.illustration()} data-slot="not-found-illustration">
          <div className={styles.orbit()} />
          <span className={styles.digit()}>4</span>
          <motion.div
            className={styles.page()}
            initial={
              effectsEnabled
                ? { opacity: 0, ...(spatialEnabled ? { y: 12, rotate: -14 } : {}) }
                : false
            }
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={fluidTween(effectsEnabled ? 300 : 0)}
          >
            <icons.search className="size-8" />
            <span className={styles.line()} />
            <span className={styles.line({ className: 'w-5' })} />
          </motion.div>
          <span className={styles.digit()}>4</span>
        </div>
      }
    />
  );
}
