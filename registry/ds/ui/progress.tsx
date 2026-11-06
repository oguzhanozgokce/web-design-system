'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  Label,
  ProgressBar,
  composeRenderProps,
  type ProgressBarProps as AriaProgressBarProps,
} from 'react-aria-components';
import { tv } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type ProgressTone = 'primary' | 'success' | 'warning' | 'error';

export type LinearProgressThickness = 4 | 8;

export type LinearProgressVariant = 'flat' | 'wavy';

export type CircularProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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
@property --ds-progress-head-1 { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --ds-progress-tail-1 { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --ds-progress-head-2 { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --ds-progress-tail-2 { syntax: '<number>'; inherits: true; initial-value: 0; }
@property --ds-progress-phase { syntax: '<length>'; inherits: true; initial-value: 0px; }
@keyframes ds-progress-head-1 {
  0% { --ds-progress-head-1: 0; animation-timing-function: cubic-bezier(0.2, 0, 0.8, 1); }
  57.143%, 100% { --ds-progress-head-1: 1; }
}
@keyframes ds-progress-tail-1 {
  0%, 14.286% { --ds-progress-tail-1: 0; animation-timing-function: cubic-bezier(0.4, 0, 1, 1); }
  71.429%, 100% { --ds-progress-tail-1: 1; }
}
@keyframes ds-progress-head-2 {
  0%, 37.143% { --ds-progress-head-2: 0; animation-timing-function: cubic-bezier(0, 0, 0.65, 1); }
  85.714%, 100% { --ds-progress-head-2: 1; }
}
@keyframes ds-progress-tail-2 {
  0%, 51.429% { --ds-progress-tail-2: 0; animation-timing-function: cubic-bezier(0.1, 0, 0.45, 1); }
  100% { --ds-progress-tail-2: 1; }
}
@keyframes ds-progress-wave {
  to { --ds-progress-phase: var(--ds-progress-wavelength); }
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

const valueTransition = 'duration-400 ease-standard motion-reduce:transition-none';

export const linearProgressStyles = tv({
  slots: {
    root: 'group/progress flex w-full min-w-0 flex-col gap-2',
    header: 'flex min-w-0 items-baseline gap-3',
    label: 'min-w-0 cursor-default text-label-lg text-on-surface',
    value: 'ms-auto shrink-0 text-body-md text-on-surface-variant tabular-digits',
    bar: '@container relative w-full shrink-0',
    lane: 'absolute inset-0',
    track: 'absolute inset-y-0 my-auto h-(--ds-progress-thickness) rounded-full',
    indicator: 'absolute inset-y-0 my-auto h-(--ds-progress-thickness) rounded-full',
    stop: 'absolute inset-y-0 inset-e-[calc((var(--ds-progress-thickness)_-_0.25rem)/2)] my-auto size-1 rounded-full',
    fill: 'absolute inset-y-0 inset-s-0',
    wave: 'absolute inset-y-0 rtl:-scale-x-100',
    pulse: 'absolute inset-0 my-auto h-(--ds-progress-thickness) rounded-full',
  },
  variants: {
    tone: {
      primary: {
        track: 'bg-secondary-container',
        indicator: 'bg-primary',
        stop: 'bg-primary',
        wave: 'bg-primary',
        pulse: 'bg-primary',
      },
      success: {
        track: 'bg-success-container',
        indicator: 'bg-success',
        stop: 'bg-success',
        wave: 'bg-success',
        pulse: 'bg-success',
      },
      warning: {
        track: 'bg-warning-container',
        indicator: 'bg-warning',
        stop: 'bg-warning',
        wave: 'bg-warning',
        pulse: 'bg-warning',
      },
      error: {
        track: 'bg-error-container',
        indicator: 'bg-error',
        stop: 'bg-error',
        wave: 'bg-error',
        pulse: 'bg-error',
      },
    },
    thickness: {
      4: { bar: '[--ds-progress-thickness:0.25rem]' },
      8: { bar: '[--ds-progress-thickness:0.5rem]' },
    },
    variant: {
      flat: { bar: 'h-(--ds-progress-thickness)' },
      wavy: { bar: 'h-[calc(var(--ds-progress-thickness)+0.375rem)]' },
    },
  },
  defaultVariants: {
    tone: 'primary',
    thickness: 4,
    variant: 'flat',
  },
});

type LinearSlots = ReturnType<typeof linearProgressStyles>;

const waveAmplitude = 3;

const wavelengths: Record<LinearProgressThickness, { determinate: number; indeterminate: number }> =
  {
    4: { determinate: 40, indeterminate: 20 },
    8: { determinate: 48, indeterminate: 32 },
  };

function waveMask(wavelength: number, thickness: number) {
  const height = thickness + waveAmplitude * 2;
  const middle = height / 2;
  const half = wavelength / 2;
  const path = `M${-wavelength} ${middle}q${wavelength / 4} ${-waveAmplitude * 2} ${half} 0${` t${half} 0`.repeat(5)}`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${wavelength}' height='${height}' viewBox='0 0 ${wavelength} ${height}'><path d='${path}' fill='none' stroke='currentColor' stroke-width='${thickness}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function waveStyle(offset: string): CSSProperties {
  return {
    maskImage: 'var(--ds-progress-wave)',
    maskSize: 'var(--ds-progress-wavelength) 100%',
    maskRepeat: 'repeat-x',
    maskPosition: `calc(var(--ds-progress-phase) - ${offset}) 0`,
  };
}

const head1 = 'var(--ds-progress-head-1)';
const tail1 = 'var(--ds-progress-tail-1)';
const head2 = 'var(--ds-progress-head-2)';
const tail2 = 'var(--ds-progress-tail-2)';

function gapBetween(head: string, tail: string) {
  return `min(var(--ds-progress-gap), (${head} - ${tail}) * 100%)`;
}

const gap1 = gapBetween(head1, tail1);
const gap2 = gapBetween(head2, tail2);

const indeterminateGeometry = {
  leadTrack: { insetInlineStart: 0, width: `max(0px, ${tail2} * 100% - ${gap2})` },
  trailingLine: {
    insetInlineStart: `calc(${tail2} * 100%)`,
    width: `calc((${head2} - ${tail2}) * 100%)`,
  },
  middleTrack: {
    insetInlineStart: `calc(${head2} * 100% + ${gap2})`,
    width: `max(0px, (${tail1} - ${head2}) * 100% - ${gap1} - ${gap2})`,
  },
  leadingLine: {
    insetInlineStart: `calc(${tail1} * 100%)`,
    width: `calc((${head1} - ${tail1}) * 100%)`,
  },
  endTrack: { insetInlineStart: `calc(${head1} * 100% + ${gap1})`, insetInlineEnd: 0 },
} satisfies Record<string, CSSProperties>;

const barAnimations = {
  flat: {
    determinate: '',
    indeterminate:
      'animate-[ds-progress-head-1_1750ms_infinite,ds-progress-tail-1_1750ms_infinite,ds-progress-head-2_1750ms_infinite,ds-progress-tail-2_1750ms_infinite] motion-reduce:animate-none',
  },
  wavy: {
    determinate: 'animate-[ds-progress-wave_1s_linear_infinite] motion-reduce:animate-none',
    indeterminate:
      'animate-[ds-progress-head-1_1750ms_infinite,ds-progress-tail-1_1750ms_infinite,ds-progress-head-2_1750ms_infinite,ds-progress-tail-2_1750ms_infinite,ds-progress-wave_1s_linear_infinite] motion-reduce:animate-none',
  },
};

interface BarProps {
  styles: LinearSlots;
  variant: LinearProgressVariant;
  motion: ProgressMotion;
}

function DeterminateBar({ styles, variant, motion, fraction }: BarProps & { fraction: number }) {
  const gap = fraction > 0 ? 'var(--ds-progress-gap)' : '0px';
  const isWavy = variant === 'wavy' && fraction > 0.1 && fraction < 0.95;
  const fade = motion === 'none' ? '' : 'transition-opacity duration-250 ease-standard';

  return (
    <>
      <span
        data-slot="track"
        className={styles.track({
          className: motion === 'full' ? `transition-[inset-inline-start] ${valueTransition}` : '',
        })}
        style={{ insetInlineStart: `calc(${fraction} * 100% + ${gap})`, insetInlineEnd: 0 }}
      />
      <span data-slot="stop" className={styles.stop()} />
      <span
        data-slot="fill"
        className={styles.fill({
          className: motion === 'full' ? `transition-[width] ${valueTransition}` : '',
        })}
        style={{ width: `calc(${fraction} * 100%)` }}
      >
        <span
          data-slot="indicator"
          className={styles.indicator({
            className: ['inset-x-0', fade, isWavy ? 'opacity-0' : ''],
          })}
        />
        {variant === 'wavy' ? (
          <span
            data-slot="wave"
            className={styles.wave({ className: ['inset-x-0', fade, isWavy ? '' : 'opacity-0'] })}
            style={waveStyle('0px')}
          />
        ) : null}
      </span>
    </>
  );
}

function IndeterminateBar({ styles, variant, motion }: BarProps) {
  const line = (slot: 'leadingLine' | 'trailingLine', tail: string) =>
    variant === 'wavy' ? (
      <span
        data-slot="wave"
        className={styles.wave()}
        style={{ ...indeterminateGeometry[slot], ...waveStyle(`${tail} * 100cqw`) }}
      />
    ) : (
      <span
        data-slot="indicator"
        className={styles.indicator()}
        style={indeterminateGeometry[slot]}
      />
    );

  const pulse = (
    <span
      data-slot="pulse"
      className={styles.pulse({
        className: [
          motion === 'full' ? 'hidden animate-ds-pulse motion-reduce:block' : '',
          motion === 'reduced' ? 'animate-ds-pulse' : '',
        ],
      })}
    />
  );

  if (motion !== 'full') return pulse;

  return (
    <>
      <span data-slot="lane" className={styles.lane({ className: 'motion-reduce:hidden' })}>
        <span
          data-slot="track"
          className={styles.track()}
          style={indeterminateGeometry.leadTrack}
        />
        {line('trailingLine', tail2)}
        <span
          data-slot="track"
          className={styles.track()}
          style={indeterminateGeometry.middleTrack}
        />
        {line('leadingLine', tail1)}
        <span data-slot="track" className={styles.track()} style={indeterminateGeometry.endTrack} />
      </span>
      {pulse}
    </>
  );
}

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
  thickness?: LinearProgressThickness;
  variant?: LinearProgressVariant;
  labels?: Partial<ProgressLabels>;
  className?: AriaProgressBarProps['className'];
}

export function LinearProgress({
  label,
  showValueLabel = false,
  tone = 'primary',
  thickness = 4,
  variant = 'flat',
  labels,
  className,
  ...props
}: LinearProgressProps) {
  const motion = useProgressMotion();
  const ariaLabel = useFallbackLabel(props, label != null, labels);
  const styles = linearProgressStyles({ tone, thickness, variant });
  const mode = props.isIndeterminate ? 'indeterminate' : 'determinate';
  const wavelength = wavelengths[thickness][mode];

  const barStyle = useMemo(
    () =>
      ({
        '--ds-progress-gap': '0.25rem',
        ...(variant === 'wavy'
          ? {
              '--ds-progress-wavelength': `${wavelength}px`,
              '--ds-progress-wave': waveMask(wavelength, thickness),
            }
          : {}),
      }) as CSSProperties,
    [variant, wavelength, thickness],
  );

  return (
    <ProgressBar
      {...props}
      aria-label={ariaLabel}
      data-slot="linear-progress"
      data-tone={tone}
      data-thickness={thickness}
      data-variant={variant}
      data-indeterminate={props.isIndeterminate || undefined}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
    >
      {({ percentage, valueText, isIndeterminate }) => {
        const showValue = showValueLabel && !isIndeterminate;
        return (
          <>
            <ProgressKeyframes />
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
            <div
              data-slot="bar"
              aria-hidden="true"
              className={styles.bar({
                className: motion === 'full' ? barAnimations[variant][mode] : '',
              })}
              style={barStyle}
            >
              {isIndeterminate ? (
                <IndeterminateBar styles={styles} variant={variant} motion={motion} />
              ) : (
                <DeterminateBar
                  styles={styles}
                  variant={variant}
                  motion={motion}
                  fraction={(percentage ?? 0) / 100}
                />
              )}
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
    track: 'fill-none',
    indicator: 'fill-none',
    value: 'col-start-1 row-start-1 text-on-surface tabular-digits',
  },
  variants: {
    size: {
      xs: { root: 'size-4', value: 'text-label-sm' },
      sm: { root: 'size-6', value: 'text-label-sm' },
      md: { root: 'size-10', value: 'text-label-sm' },
      lg: { root: 'size-12', value: 'text-label-md' },
      xl: { root: 'size-16', value: 'text-label-lg' },
    },
    tone: {
      primary: { track: 'stroke-secondary-container', indicator: 'stroke-primary' },
      success: { track: 'stroke-success-container', indicator: 'stroke-success' },
      warning: { track: 'stroke-warning-container', indicator: 'stroke-warning' },
      error: { track: 'stroke-error-container', indicator: 'stroke-error' },
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'primary',
  },
});

const circularGeometry: Record<
  CircularProgressSize,
  { diameter: number; stroke: number; gap: number }
> = {
  xs: { diameter: 16, stroke: 2, gap: 2 },
  sm: { diameter: 24, stroke: 3, gap: 3 },
  md: { diameter: 40, stroke: 4, gap: 4 },
  lg: { diameter: 48, stroke: 4, gap: 4 },
  xl: { diameter: 64, stroke: 6, gap: 4 },
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
  const { diameter, stroke, gap } = circularGeometry[size];
  const radius = (diameter - stroke) / 2;
  const gapUnits = ((gap + stroke) / (2 * Math.PI * radius)) * 100;
  const circle = {
    cx: diameter / 2,
    cy: diameter / 2,
    r: radius,
    pathLength: 100,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
  };
  const valueMotion =
    motion === 'full'
      ? `transition-[stroke-dasharray,stroke-dashoffset,opacity] ${valueTransition}`
      : '';

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
        const valueGap = value > 0 ? Math.min(value, gapUnits) : 0;
        const trackLength = 100 - value - valueGap * 2;
        return (
          <>
            <ProgressKeyframes />
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
              {isIndeterminate ? (
                <circle
                  {...circle}
                  data-slot="indicator"
                  strokeDasharray="70 100"
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
                <>
                  <circle
                    {...circle}
                    data-slot="track"
                    className={styles.track({
                      className: [valueMotion, trackLength > 0 ? '' : 'opacity-0'],
                    })}
                    style={{
                      strokeDasharray: `${Math.max(trackLength, 0)} 100`,
                      strokeDashoffset: -(value + valueGap),
                    }}
                  />
                  <circle
                    {...circle}
                    data-slot="indicator"
                    className={styles.indicator({
                      className: [valueMotion, value > 0 ? '' : 'opacity-0'],
                    })}
                    style={{ strokeDasharray: `${value} 100` }}
                  />
                </>
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
