'use client';

import { useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react';
import { motionEasings } from '@/registry/ds/lib/motion';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type ActivityBarsSize = 'sm' | 'md' | 'lg';

export type ActivityBarsCount = 3 | 4 | 5;

const barRhythm = [
  { duration: 0.9, delay: 0, still: 0.55 },
  { duration: 0.7, delay: 0.12, still: 1 },
  { duration: 1.1, delay: 0.06, still: 0.7 },
  { duration: 0.8, delay: 0.18, still: 0.85 },
  { duration: 1, delay: 0.09, still: 0.45 },
] as const;

const activityBarsKeyframes = `
@keyframes ds-activity-bar {
  from { height: var(--ds-bar-rest); }
  to { height: 100%; }
}
`;

function ActivityBarsKeyframes() {
  return (
    <style href="ds-activity-bars" precedence="ds">
      {activityBarsKeyframes}
    </style>
  );
}

export const activityBarsStyles = tv({
  slots: {
    root: [
      'group/bars inline-flex shrink-0 items-center justify-center [contain:strict] [--ds-bar-rest:25%]',
      'w-[calc(var(--ds-bar-count)*var(--ds-bar-width)+(var(--ds-bar-count)-1)*var(--ds-bar-gap))] gap-(--ds-bar-gap)',
    ],
    bar: [
      'h-(--ds-bar-rest) w-(--ds-bar-width) shrink-0 rounded-full bg-current',
      'group-data-[running]/bars:animate-[ds-activity-bar_var(--ds-bar-duration)_ease-in-out_var(--ds-bar-delay)_infinite_alternate_backwards]',
      'motion-reduce:group-data-[running]/bars:h-(--ds-bar-still) motion-reduce:group-data-[running]/bars:animate-none',
    ],
  },
  variants: {
    size: {
      sm: { root: 'h-3 [--ds-bar-gap:2px] [--ds-bar-width:2px]' },
      md: { root: 'h-4 [--ds-bar-gap:2px] [--ds-bar-width:3px]' },
      lg: { root: 'h-6 [--ds-bar-gap:3px] [--ds-bar-width:4px]' },
    },
    still: {
      true: { bar: 'h-(--ds-bar-still)' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type ActivityBarsStyleProps = VariantProps<typeof activityBarsStyles>;

export interface ActivityBarsProps extends Omit<ComponentProps<'span'>, 'children'> {
  isActive?: boolean;
  count?: ActivityBarsCount;
  size?: ActivityBarsSize;
}

export function ActivityBars({
  isActive = true,
  count = 4,
  size = 'md',
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ActivityBarsProps) {
  const { decorativeEnabled } = useMotionPreference();
  const isRunning = isActive && decorativeEnabled;
  const [initiallyRunning] = useState(isRunning);
  const ref = useRef<HTMLSpanElement>(null);
  const styles = activityBarsStyles({ size, still: isActive && !decorativeEnabled });
  const isLabelled = Boolean(ariaLabel || ariaLabelledBy);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || root.hasAttribute('data-running') === isRunning) return;
    if (isRunning) {
      root.setAttribute('data-running', '');
      return;
    }
    const bars = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-slot="bar"]'));
    const from = bars.map((bar) => getComputedStyle(bar).height);
    root.removeAttribute('data-running');
    if (!decorativeEnabled) return;
    bars.forEach((bar, index) => {
      bar.animate([{ height: from[index] }, { height: getComputedStyle(bar).height }], {
        duration: 250,
        easing: `cubic-bezier(${motionEasings.outQuad.join(',')})`,
      });
    });
  }, [isRunning, decorativeEnabled]);

  return (
    <span
      {...props}
      ref={ref}
      role={isLabelled ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-hidden={isLabelled ? undefined : true}
      data-slot="activity-bars"
      data-size={size}
      data-active={isActive || undefined}
      data-running={initiallyRunning || undefined}
      style={{ '--ds-bar-count': count, ...style } as CSSProperties}
      className={styles.root({ className })}
    >
      <ActivityBarsKeyframes />
      {barRhythm.slice(0, count).map((rhythm, index) => (
        <span
          key={index}
          data-slot="bar"
          className={styles.bar()}
          style={
            {
              '--ds-bar-duration': `${rhythm.duration}s`,
              '--ds-bar-delay': `${rhythm.delay}s`,
              '--ds-bar-still': `${rhythm.still * 100}%`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
