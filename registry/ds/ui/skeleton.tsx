'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { cn, tv } from '@/registry/ds/lib/utils';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type SkeletonShape = 'text' | 'circle' | 'rect';

export const skeletonStyles = tv({
  slots: {
    root: 'max-w-full',
    block: 'bg-surface-container-highest',
    line: 'my-[0.2lh] block h-[0.6lh] w-full shrink-0 rounded-xs',
    content: 'contents',
  },
  variants: {
    shape: {
      text: { root: 'flex w-full flex-col', block: 'rounded-xs' },
      circle: { root: 'block size-10 shrink-0 rounded-full', block: 'rounded-full' },
      rect: { root: 'block h-24 w-full rounded-md', block: 'rounded-md' },
    },
    motion: {
      full: {
        block:
          'skeleton-shimmer animate-ds-shimmer rtl:[animation-direction:reverse] motion-reduce:animate-ds-pulse motion-reduce:bg-none',
      },
      reduced: { block: 'animate-ds-pulse' },
      none: { block: '' },
    },
    isLoaded: {
      true: {},
      false: { content: 'invisible' },
    },
  },
  defaultVariants: {
    shape: 'rect',
    motion: 'full',
    isLoaded: false,
  },
});

function useSkeletonMotion() {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'full';
  return effectsEnabled ? 'reduced' : 'none';
}

function hasContent(children: ReactNode) {
  return children != null && typeof children !== 'boolean';
}

export interface SkeletonProps extends ComponentProps<'div'> {
  shape?: SkeletonShape;
  lines?: number;
  isLoaded?: boolean;
  children?: ReactNode;
}

export function Skeleton({
  shape = 'rect',
  lines = 1,
  isLoaded = false,
  className,
  children,
  ...props
}: SkeletonProps) {
  const motion = useSkeletonMotion();
  const [wasLoading, setWasLoading] = useState(!isLoaded);
  if (!isLoaded && !wasLoading) setWasLoading(true);
  const styles = skeletonStyles({ shape, motion, isLoaded });

  if (hasContent(children)) {
    return (
      <div
        {...props}
        aria-hidden={isLoaded ? undefined : true}
        data-slot="skeleton"
        data-shape={shape}
        data-loaded={isLoaded ? 'true' : undefined}
        className={
          isLoaded
            ? cn(wasLoading && motion !== 'none' && 'animate-ds-fade-in', className)
            : styles.block({ className: ['relative', className] })
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
      <div
        {...props}
        aria-hidden="true"
        data-slot="skeleton"
        data-shape={shape}
        className={styles.root({ className })}
      >
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
      aria-hidden="true"
      data-slot="skeleton"
      data-shape={shape}
      className={styles.root({ className: [styles.block(), className] })}
    />
  );
}
