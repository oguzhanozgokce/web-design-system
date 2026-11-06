'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Heading } from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { ButtonGroupContext, type ButtonStyleProps } from '@/registry/ds/ui/button';

export type EmptyStateSize = 'compact' | 'default' | 'page';

export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const emptyStateStyles = tv({
  slots: {
    root: 'mx-auto flex w-full flex-col items-center text-center',
    media: 'inline-flex shrink-0 items-center justify-center',
    content: 'flex w-full flex-col items-center [overflow-wrap:anywhere]',
    title: 'text-on-surface',
    description: 'text-on-surface-variant',
    extra: 'text-on-surface-variant',
    actions: 'flex flex-wrap items-center justify-center',
  },
  variants: {
    size: {
      compact: {
        root: 'gap-3 px-4 py-6',
        content: 'max-w-sm gap-1',
        title: 'text-title-sm',
        description: 'text-body-sm',
        extra: 'text-body-sm',
        actions: 'gap-1',
      },
      default: {
        root: 'gap-4 px-6 py-10',
        content: 'max-w-md gap-2',
        title: 'text-title-lg',
        description: 'text-body-md',
        extra: 'text-body-md',
        actions: 'gap-2 pt-2',
      },
      page: {
        root: 'min-h-[min(32rem,70dvh)] justify-center gap-6 px-6 py-16',
        content: 'max-w-lg gap-3',
        title: 'text-headline-sm',
        description: 'text-body-lg',
        extra: 'text-body-lg',
        actions: 'gap-3 pt-2',
      },
    },
    media: {
      icon: { media: '[&_svg]:size-[1em]' },
      illustration: {
        media: '[&>img]:h-full [&>img]:w-auto [&>svg]:h-full [&>svg]:w-auto',
      },
    },
  },
  compoundVariants: [
    { size: 'compact', media: 'icon', class: { media: 'text-[1.5rem] text-on-surface-variant' } },
    {
      size: 'default',
      media: 'icon',
      class: { media: 'size-16 rounded-full bg-surface-container-high text-[2rem] text-primary' },
    },
    {
      size: 'page',
      media: 'icon',
      class: {
        media: 'size-22 rounded-full bg-surface-container-high text-[2.75rem] text-primary',
      },
    },
    { size: 'compact', media: 'illustration', class: { media: 'h-16' } },
    { size: 'default', media: 'illustration', class: { media: 'h-28' } },
    { size: 'page', media: 'illustration', class: { media: 'h-40 sm:h-48' } },
  ],
  defaultVariants: {
    size: 'default',
    media: 'icon',
  },
});

const actionStyles: Record<
  EmptyStateSize,
  { primary: ButtonStyleProps; secondary: ButtonStyleProps }
> = {
  compact: { primary: { variant: 'text', size: 'sm' }, secondary: { variant: 'text', size: 'sm' } },
  default: {
    primary: { variant: 'filled', size: 'md' },
    secondary: { variant: 'text', size: 'md' },
  },
  page: {
    primary: { variant: 'filled', size: 'md' },
    secondary: { variant: 'outlined', size: 'md' },
  },
};

export interface EmptyStateProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  illustration?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  size?: EmptyStateSize;
  headingLevel?: EmptyStateHeadingLevel;
}

export function EmptyState({
  title,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  size = 'default',
  headingLevel = 2,
  children,
  className,
  ...props
}: EmptyStateProps) {
  const hasIllustration = illustration != null && illustration !== false;
  const media = hasIllustration ? illustration : icon;
  const styles = emptyStateStyles({ size, media: hasIllustration ? 'illustration' : 'icon' });
  const buttons = actionStyles[size];
  const hasActions = primaryAction != null || secondaryAction != null;

  return (
    <div {...props} data-slot="empty-state" data-size={size} className={styles.root({ className })}>
      {media != null && media !== false ? (
        <div data-slot="media" aria-hidden="true" className={styles.media()}>
          {media}
        </div>
      ) : null}
      <div data-slot="content" className={styles.content()}>
        <Heading level={headingLevel} data-slot="title" className={styles.title()}>
          {title}
        </Heading>
        {description != null ? (
          <p data-slot="description" className={styles.description()}>
            {description}
          </p>
        ) : null}
        {children != null ? (
          <div data-slot="extra" className={styles.extra()}>
            {children}
          </div>
        ) : null}
      </div>
      {hasActions ? (
        <div data-slot="actions" className={styles.actions()}>
          {primaryAction != null ? (
            <ButtonGroupContext value={buttons.primary}>{primaryAction}</ButtonGroupContext>
          ) : null}
          {secondaryAction != null ? (
            <ButtonGroupContext value={buttons.secondary}>{secondaryAction}</ButtonGroupContext>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
