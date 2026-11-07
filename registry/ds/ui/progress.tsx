'use client';

import type { ReactNode } from 'react';
import {
  Label,
  ProgressBar,
  composeRenderProps,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type ProgressTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';

export type LinearProgressSize = 'sm' | 'md' | 'lg';

export type CircularProgressSize = 'sm' | 'md' | 'lg' | 'xl';

type ProgressMotion = 'full' | 'reduced' | 'none';

export interface ProgressLabels {
  loading: string;
  progress: string;
}

export const defaultProgressLabels: ProgressLabels = {
  loading: 'Loading',
  progress: 'Progress',
};

const progressKeyframes = `
@keyframes ds-progress-slide {
  from { translate: calc(var(--ds-direction, 1) * -100%) 0; }
  to { translate: calc(var(--ds-direction, 1) * 250%) 0; }
}
@keyframes ds-progress-rotate {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}
@keyframes ds-progress-arc {
  0% { stroke-dasharray: 1 100; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 70 100; stroke-dashoffset: -15; }
  100% { stroke-dasharray: 70 100; stroke-dashoffset: -99; }
}
`;

function ProgressKeyframes() {
  return (
    <style href="ds-progress" precedence="ds">
      {progressKeyframes}
    </style>
  );
}

function useProgressMotion(): ProgressMotion {
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  if (spatialEnabled) return 'full';
  return effectsEnabled ? 'reduced' : 'none';
}

const fills: Record<ProgressTone, string> = {
  primary: 'bg-primary-solid',
  neutral: 'bg-on-surface',
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  error: 'bg-error-solid',
  info: 'bg-info-solid',
};

const strokes: Record<ProgressTone, string> = {
  primary: 'stroke-primary-solid',
  neutral: 'stroke-on-surface',
  success: 'stroke-success-solid',
  warning: 'stroke-warning-solid',
  error: 'stroke-error-solid',
  info: 'stroke-info-solid',
};

export const linearProgressStyles = tv({
  slots: {
    root: 'group/progress flex w-full min-w-0 flex-col gap-2',
    header: 'flex min-w-0 items-baseline gap-3',
    label: 'min-w-0 cursor-default text-sm font-medium text-on-surface',
    value: 'ms-auto shrink-0 text-sm text-on-surface-variant tabular-digits',
    track: 'relative w-full shrink-0 overflow-hidden rounded-full bg-neutral-soft',
    indicator: 'absolute inset-y-0 inset-s-0 rounded-full',
  },
  variants: {
    tone: {
      primary: { indicator: fills.primary },
      neutral: { indicator: fills.neutral },
      success: { indicator: fills.success },
      warning: { indicator: fills.warning },
      error: { indicator: fills.error },
      info: { indicator: fills.info },
    },
    size: {
      sm: { track: 'h-1' },
      md: { track: 'h-2' },
      lg: { track: 'h-3' },
    },
    mode: {
      determinate: {},
      indeterminate: {},
    },
    motion: {
      full: {},
      reduced: {},
      none: {},
    },
  },
  compoundVariants: [
    {
      mode: 'determinate',
      motion: 'full',
      class: {
        indicator: 'transition-[width] duration-300 ease-out motion-reduce:transition-none',
      },
    },
    {
      mode: 'indeterminate',
      motion: 'full',
      class: {
        indicator: [
          'w-2/5 animate-[ds-progress-slide_1.5s_cubic-bezier(0.65,0,0.35,1)_infinite]',
          'motion-reduce:w-full motion-reduce:animate-ds-pulse',
        ],
      },
    },
    {
      mode: 'indeterminate',
      motion: 'reduced',
      class: { indicator: 'w-full animate-ds-pulse' },
    },
    {
      mode: 'indeterminate',
      motion: 'none',
      class: { indicator: 'w-full opacity-50' },
    },
  ],
  defaultVariants: {
    tone: 'primary',
    size: 'md',
    mode: 'determinate',
    motion: 'full',
  },
});

function useFallbackLabel(
  props: Pick<AriaProgressBarProps, 'aria-label' | 'aria-labelledby' | 'isIndeterminate'>,
  hasLabel: boolean,
  labels?: Partial<ProgressLabels>,
) {
  const t = useLabels('progress', defaultProgressLabels, labels);
  if (hasLabel || props['aria-labelledby']) return props['aria-label'];
  return props['aria-label'] ?? (props.isIndeterminate ? t.loading : t.progress);
}

export interface LinearProgressProps extends Omit<
  AriaProgressBarProps,
  'children' | 'className' | 'valueLabel'
> {
  label?: ReactNode;
  valueLabel?: string;
  showValueLabel?: boolean;
  tone?: ProgressTone;
  size?: LinearProgressSize;
  labels?: Partial<ProgressLabels>;
  className?: AriaProgressBarProps['className'];
}

export function LinearProgress({
  label,
  showValueLabel = false,
  tone = 'primary',
  size = 'md',
  labels,
  className,
  ...props
}: LinearProgressProps) {
  const motion = useProgressMotion();
  const ariaLabel = useFallbackLabel(props, label != null, labels);
  const mode = props.isIndeterminate ? 'indeterminate' : 'determinate';
  const styles = linearProgressStyles({ tone, size, mode, motion });

  return (
    <ProgressBar
      {...props}
      aria-label={ariaLabel}
      data-slot="linear-progress"
      data-tone={tone}
      data-size={size}
      data-indeterminate={props.isIndeterminate || undefined}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      {({ percentage, valueText, isIndeterminate }) => {
        const showValue = showValueLabel && !isIndeterminate;
        return (
          <>
            {isIndeterminate && motion === 'full' ? <ProgressKeyframes /> : null}
            {label != null || showValue ? (
              <div data-slot="header" className={styles.header()}>
                {label != null ? (
                  <Label data-slot="label" className={styles.label()}>
                    {label}
                  </Label>
                ) : null}
                {showValue ? (
                  <span data-slot="value" className={styles.value()}>
                    {valueText}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div data-slot="track" aria-hidden="true" className={styles.track()}>
              <span
                data-slot="indicator"
                className={styles.indicator()}
                style={isIndeterminate ? undefined : { width: `${percentage ?? 0}%` }}
              />
            </div>
          </>
        );
      }}
    </ProgressBar>
  );
}

export const circularProgressStyles = tv({
  slots: {
    root: 'relative inline-grid shrink-0 place-items-center align-middle',
    svg: 'col-start-1 row-start-1 size-full -rotate-90 overflow-visible',
    track: 'fill-none stroke-neutral-soft',
    indicator: 'fill-none',
    value: 'col-start-1 row-start-1 font-medium text-on-surface tabular-digits',
  },
  variants: {
    size: {
      sm: { root: 'size-5', value: 'text-[0.5rem]' },
      md: { root: 'size-7', value: 'text-[0.5625rem]' },
      lg: { root: 'size-9', value: 'text-[0.625rem]' },
      xl: { root: 'size-12', value: 'text-xs' },
    },
    tone: {
      primary: { indicator: strokes.primary },
      neutral: { indicator: strokes.neutral },
      success: { indicator: strokes.success },
      warning: { indicator: strokes.warning },
      error: { indicator: strokes.error },
      info: { indicator: strokes.info },
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'primary',
  },
});

const circularGeometry: Record<CircularProgressSize, { diameter: number; stroke: number }> = {
  sm: { diameter: 20, stroke: 2.5 },
  md: { diameter: 28, stroke: 3 },
  lg: { diameter: 36, stroke: 3.5 },
  xl: { diameter: 48, stroke: 4 },
};

export interface CircularProgressProps extends Omit<
  AriaProgressBarProps,
  'children' | 'className' | 'valueLabel'
> {
  valueLabel?: string;
  size?: CircularProgressSize;
  tone?: ProgressTone;
  showValueLabel?: boolean;
  labels?: Partial<ProgressLabels>;
  className?: AriaProgressBarProps['className'];
}

export function CircularProgress({
  size = 'md',
  tone = 'primary',
  showValueLabel = false,
  labels,
  className,
  ...props
}: CircularProgressProps) {
  const motion = useProgressMotion();
  const ariaLabel = useFallbackLabel(props, false, labels);
  const styles = circularProgressStyles({ size, tone });
  const { diameter, stroke } = circularGeometry[size];
  const circle = {
    cx: diameter / 2,
    cy: diameter / 2,
    r: (diameter - stroke) / 2,
    pathLength: 100,
    strokeWidth: stroke,
  };

  return (
    <ProgressBar
      {...props}
      aria-label={ariaLabel}
      data-slot="circular-progress"
      data-tone={tone}
      data-size={size}
      data-indeterminate={props.isIndeterminate || undefined}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      {({ percentage, valueText, isIndeterminate }) => {
        const value = percentage ?? 0;
        return (
          <>
            {isIndeterminate && motion === 'full' ? <ProgressKeyframes /> : null}
            <svg
              viewBox={`0 0 ${diameter} ${diameter}`}
              aria-hidden="true"
              focusable="false"
              className={styles.svg({
                className:
                  isIndeterminate && motion === 'full'
                    ? 'animate-[ds-progress-rotate_2s_linear_infinite] motion-reduce:animate-none'
                    : '',
              })}
            >
              <circle {...circle} data-slot="track" className={styles.track()} />
              {isIndeterminate ? (
                <circle
                  {...circle}
                  data-slot="indicator"
                  strokeLinecap="round"
                  strokeDasharray="25 100"
                  className={styles.indicator({
                    className: [
                      motion === 'full'
                        ? 'animate-[ds-progress-arc_1.5s_ease-in-out_infinite] motion-reduce:animate-ds-pulse'
                        : '',
                      motion === 'reduced' ? 'animate-ds-pulse' : '',
                    ],
                  })}
                />
              ) : (
                <circle
                  {...circle}
                  data-slot="indicator"
                  strokeLinecap="round"
                  className={styles.indicator({
                    className: [
                      motion === 'full'
                        ? 'transition-[stroke-dasharray,opacity] duration-300 ease-out motion-reduce:transition-none'
                        : '',
                      value > 0 ? '' : 'opacity-0',
                    ],
                  })}
                  style={{ strokeDasharray: `${value} 100` }}
                />
              )}
            </svg>
            {showValueLabel && !isIndeterminate ? (
              <span data-slot="value" className={styles.value()}>
                {valueText}
              </span>
            ) : null}
          </>
        );
      }}
    </ProgressBar>
  );
}
