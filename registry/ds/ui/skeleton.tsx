'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { cn, tv } from '@/registry/ds/lib/utils';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type SkeletonShape = 'text' | 'block' | 'circle';

export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export const skeletonStyles = tv({
  slots: {
    root: 'max-w-full',
    block: 'relative overflow-hidden bg-neutral-soft',
    line: 'my-[0.2lh] block h-[0.6lh] w-full shrink-0',
    content: 'contents',
  },
  variants: {
    shape: {
      text: { root: 'flex w-full flex-col', block: 'rounded-sm' },
      block: { root: 'block h-24 w-full', block: 'rounded-container' },
      circle: { root: 'block size-10 shrink-0', block: 'rounded-full' },
    },
    animation: {
      shimmer: {
        block: [
          'after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-on-surface/6 after:to-transparent',
          'after:animate-ds-shimmer',
          'motion-reduce:animate-ds-pulse motion-reduce:after:hidden',
        ],
      },
      pulse: { block: 'animate-ds-pulse' },
      none: { block: '' },
    },
    isLoaded: {
      true: {},
      false: { content: 'invisible' },
    },
  },
  defaultVariants: {
    shape: 'block',
    animation: 'shimmer',
    isLoaded: false,
  },
});

function useSkeletonAnimation(requested: SkeletonAnimation): SkeletonAnimation {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (requested === 'none' || (!spatialEnabled && !effectsEnabled)) return 'none';
  return spatialEnabled ? requested : 'pulse';
}

function hasContent(children: ReactNode) {
  return children != null && typeof children !== 'boolean';
}

export interface SkeletonProps extends ComponentProps<'div'> {
  shape?: SkeletonShape;
  animation?: SkeletonAnimation;
  lines?: number;
  isLoaded?: boolean;
  children?: ReactNode;
}

export function Skeleton({
  shape = 'block',
  animation: animationProp = 'shimmer',
  lines = 1,
  isLoaded = false,
  className,
  children,
  ...props
}: SkeletonProps) {
  const animation = useSkeletonAnimation(animationProp);
  const [wasLoading, setWasLoading] = useState(!isLoaded);
  if (!isLoaded && !wasLoading) setWasLoading(true);
  const styles = skeletonStyles({ shape, animation, isLoaded });
  const dataProps = {
    'data-slot': 'skeleton',
    'data-shape': shape,
    'data-animation': animation,
  };

  if (hasContent(children)) {
    return (
      <div
        {...props}
        {...dataProps}
        aria-hidden={isLoaded ? undefined : true}
        data-loaded={isLoaded ? 'true' : undefined}
        className={
          isLoaded
            ? cn(wasLoading && animation !== 'none' && 'animate-ds-fade-in', className)
            : styles.block({ className })
        }
      >
        <div data-slot="skeleton-content" inert={!isLoaded} className={styles.content()}>
          {children}
        </div>
      </div>
    );
  }

  if (isLoaded) return null;

  if (shape === 'text') {
    const count = Math.max(1, Math.floor(lines));
    return (
      <div {...props} {...dataProps} aria-hidden="true" className={styles.root({ className })}>
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            data-slot="skeleton-line"
            className={styles.line({
              className: [styles.block(), count > 1 && index === count - 1 ? 'w-3/5' : ''],
            })}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      {...props}
      {...dataProps}
      aria-hidden="true"
      className={styles.root({ className: [styles.block(), className] })}
    />
  );
}
