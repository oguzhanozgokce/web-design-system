'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Heading } from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { ButtonGroupContext, type ButtonStyleProps } from '@/registry/ds/ui/button';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const emptyStateStyles = tv({
  slots: {
    root: 'mx-auto flex w-full flex-col items-center text-center',
    media: 'inline-flex shrink-0 items-center justify-center',
    content: 'flex w-full flex-col items-center [overflow-wrap:anywhere]',
    title: 'font-semibold text-on-surface',
    description: 'text-on-surface-variant',
    extra: 'text-on-surface-variant',
    actions: 'flex flex-wrap items-center justify-center gap-2',
  },
  variants: {
    size: {
      sm: {
        root: 'gap-2 p-4',
        content: 'max-w-xs gap-0.5',
        title: 'text-sm',
        description: 'text-xs',
        extra: 'text-xs',
        actions: 'pt-1',
      },
      md: {
        root: 'gap-4 px-6 py-8',
        content: 'max-w-[22.5rem] gap-1',
        title: 'text-lg',
        description: 'text-sm',
        extra: 'text-sm',
      },
      lg: {
        root: 'min-h-[min(32rem,70dvh)] justify-center gap-5 px-6 py-16',
        content: 'max-w-md gap-2',
        title: 'text-2xl tracking-tight',
        description: 'text-base',
        extra: 'text-base',
        actions: 'pt-1',
      },
    },
    media: {
      icon: {
        media: 'rounded-full bg-neutral-soft text-on-surface-variant [&_svg]:size-[1em]',
      },
      illustration: {
        media: '[&>img]:h-full [&>img]:w-auto [&>svg]:h-full [&>svg]:w-auto',
      },
    },
  },
  compoundVariants: [
    { size: 'sm', media: 'icon', class: { media: 'size-10 text-[1.25rem]' } },
    { size: 'md', media: 'icon', class: { media: 'size-12 text-[1.5rem]' } },
    { size: 'lg', media: 'icon', class: { media: 'size-16 text-[2rem]' } },
    { size: 'sm', media: 'illustration', class: { media: 'h-16' } },
    { size: 'md', media: 'illustration', class: { media: 'h-28' } },
    { size: 'lg', media: 'illustration', class: { media: 'h-40 sm:h-48' } },
  ],
  defaultVariants: {
    size: 'md',
    media: 'icon',
  },
});

const actionStyles: Record<
  EmptyStateSize,
  { primary: ButtonStyleProps; secondary: ButtonStyleProps }
> = {
  sm: {
    primary: { variant: 'soft', size: 'sm' },
    secondary: { variant: 'ghost', size: 'sm' },
  },
  md: {
    primary: { variant: 'solid', size: 'md' },
    secondary: { variant: 'soft', size: 'md' },
  },
  lg: {
    primary: { variant: 'solid', size: 'md' },
    secondary: { variant: 'soft', size: 'md' },
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
  size = 'md',
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
