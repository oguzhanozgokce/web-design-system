'use client';

import { use, useId, type CSSProperties, type ReactNode, type Ref } from 'react';
import {
  Label,
  Slider as AriaSlider,
  SliderOutput,
  SliderStateContext,
  SliderThumb,
  SliderTrack,
  composeRenderProps,
  type SliderProps as AriaSliderProps,
  type SliderState,
} from 'react-aria-components';
import { tv, type VariantProps } from '@/registry/ds/lib/utils';
import { useDirection, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export const sliderStyles = tv({
  slots: {
    root: 'group/slider flex min-w-0 flex-col gap-1 [--slider-gap:0.5rem] [--slider-handle-width:0.25rem]',
    header: 'flex min-w-0 gap-x-3 gap-y-0.5',
    label:
      'min-w-0 cursor-default text-label-lg text-on-surface group-data-[disabled]/slider:text-on-surface/38 forced-colors:group-data-[disabled]/slider:text-[GrayText]',
    output:
      'shrink-0 text-body-md text-on-surface-variant tabular-digits group-data-[disabled]/slider:text-on-surface/38 forced-colors:group-data-[disabled]/slider:text-[GrayText]',
    control: 'flex',
    track: 'relative shrink-0 cursor-default',
    rail: 'absolute forced-colors:forced-color-adjust-none',
    segment: 'absolute',
    stops: 'absolute inset-0',
    stop: 'absolute size-1 rounded-full',
    thumb: [
      'focus-ring group/thumb absolute z-10 rounded-full bg-primary data-[disabled]:bg-on-surface/38',
      'forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none forced-colors:data-[disabled]:bg-[GrayText] forced-colors:data-[focus-visible]:outline-[Highlight]',
      "after:absolute after:content-['']",
      'data-[dragging]:z-20 data-[focus-visible]:z-20',
      'transition-[width,height] duration-(--ds-duration-spatial-fast) ease-spatial-fast motion-reduce:transition-none',
    ],
    indicator: 'pointer-events-none absolute flex',
    bubble: [
      'flex h-11 min-w-12 shrink-0 items-center justify-center rounded-full bg-inverse-surface px-4 text-label-lg whitespace-nowrap text-inverse-on-surface tabular-digits',
      'scale-75 opacity-0 transition-[opacity,scale] duration-[var(--ds-duration-effect-fast),var(--ds-duration-spatial-fast)] ease-[var(--ds-ease-effect-fast),var(--ds-ease-spatial-fast)] motion-reduce:scale-100',
      'group-data-[dragging]/thumb:scale-100 group-data-[dragging]/thumb:opacity-100',
      'group-data-[focus-visible]/thumb:scale-100 group-data-[focus-visible]/thumb:opacity-100',
      'forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]',
    ],
    marks:
      'relative text-body-sm text-on-surface-variant select-none group-data-[disabled]/slider:text-on-surface/38 forced-colors:group-data-[disabled]/slider:text-[GrayText]',
    mark: 'absolute flex',
    markLabel: 'whitespace-nowrap',
    sizer: 'invisible col-start-1 row-start-1 whitespace-nowrap',
    description:
      'text-body-sm text-on-surface-variant group-data-[disabled]/slider:text-on-surface/38 forced-colors:group-data-[disabled]/slider:text-[GrayText]',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'w-full',
        header: 'items-baseline',
        output: 'ms-auto',
        control: 'flex-col',
        track: 'mx-(--slider-gap) h-(--slider-handle)',
        rail: '-inset-x-(--slider-gap) inset-y-0 my-auto h-(--slider-track)',
        segment: 'inset-y-0',
        stop: 'inset-y-0 my-auto -ms-0.5',
        thumb:
          'top-1/2 h-(--slider-handle) w-(--slider-handle-width) after:-inset-x-2 after:inset-y-0 data-[dragging]:w-0.5',
        indicator: 'inset-x-0 bottom-full justify-center pb-1',
        bubble: 'origin-bottom',
        marks: 'mx-(--slider-gap) h-4',
        mark: 'inset-y-0 w-0',
      },
      vertical: {
        root: 'h-60 w-fit items-center',
        header: 'flex-col items-center text-center',
        control: 'min-h-0 flex-1',
        track: 'my-(--slider-gap) w-(--slider-handle)',
        rail: '-inset-y-(--slider-gap) inset-x-0 mx-auto w-(--slider-track)',
        segment: 'inset-x-0',
        stop: 'inset-x-0 mx-auto -mb-0.5',
        thumb:
          'inset-x-0 mx-auto h-(--slider-handle-width) w-(--slider-handle) after:inset-x-0 after:-inset-y-2 data-[dragging]:h-0.5',
        indicator: 'inset-y-0 inset-e-full items-center pe-1',
        bubble: 'origin-right',
        marks: 'my-(--slider-gap) grid content-start',
        mark: 'inset-s-0 h-0 items-center',
      },
    },
    size: {
      sm: {
        root: '[--slider-handle:2.75rem] [--slider-radius:var(--radius-sm)] [--slider-track:1rem]',
      },
      md: {
        root: '[--slider-handle:2.75rem] [--slider-radius:var(--radius-sm)] [--slider-track:1.5rem]',
      },
      lg: {
        root: '[--slider-handle:3.25rem] [--slider-radius:var(--radius-md)] [--slider-track:2.5rem]',
      },
    },
    tone: {
      active: {
        segment: [
          'bg-primary group-data-[disabled]/slider:bg-on-surface/38',
          'forced-colors:bg-[Highlight] forced-colors:group-data-[disabled]/slider:bg-[GrayText]',
        ],
        stop: [
          'bg-on-primary group-data-[disabled]/slider:bg-inverse-on-surface',
          'forced-colors:bg-[HighlightText] forced-colors:group-data-[disabled]/slider:bg-[Canvas]',
        ],
      },
      inactive: {
        segment: [
          'bg-secondary-container group-data-[disabled]/slider:bg-on-surface/12',
          'forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:group-data-[disabled]/slider:border-[GrayText]',
        ],
        stop: [
          'bg-on-secondary-container group-data-[disabled]/slider:bg-on-surface/38',
          'forced-colors:bg-[CanvasText] forced-colors:group-data-[disabled]/slider:bg-[GrayText]',
        ],
      },
    },
    startCap: { edge: '', gap: '', seam: '' },
    endCap: { edge: '', gap: '', seam: '' },
    markAlign: {
      start: { mark: 'justify-start' },
      center: { mark: 'justify-center' },
      end: { mark: 'justify-end' },
    },
    motion: {
      full: '',
      reduced: { thumb: 'transition-none', bubble: 'scale-100' },
      none: { thumb: 'transition-none', bubble: 'transition-none' },
    },
    direction: { ltr: '', rtl: '' },
    raised: { true: { thumb: 'z-11' }, false: '' },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      startCap: 'edge',
      class: { segment: 'rounded-s-(--slider-radius)' },
    },
    { orientation: 'horizontal', startCap: 'gap', class: { segment: 'rounded-s-[0.125rem]' } },
    {
      orientation: 'horizontal',
      endCap: 'edge',
      class: { segment: 'rounded-e-(--slider-radius)' },
    },
    { orientation: 'horizontal', endCap: 'gap', class: { segment: 'rounded-e-[0.125rem]' } },
    {
      orientation: 'vertical',
      startCap: 'edge',
      class: { segment: 'rounded-b-(--slider-radius)' },
    },
    { orientation: 'vertical', startCap: 'gap', class: { segment: 'rounded-b-[0.125rem]' } },
    { orientation: 'vertical', endCap: 'edge', class: { segment: 'rounded-t-(--slider-radius)' } },
    { orientation: 'vertical', endCap: 'gap', class: { segment: 'rounded-t-[0.125rem]' } },
    { orientation: 'vertical', direction: 'rtl', class: { bubble: 'origin-left' } },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    size: 'sm',
    motion: 'full',
    direction: 'ltr',
  },
});

type SliderSlots = ReturnType<typeof sliderStyles>;

export type SliderStyleProps = Pick<VariantProps<typeof sliderStyles>, 'size'>;

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export interface SliderLabels {
  minimum: string;
  maximum: string;
}

export const defaultSliderLabels: SliderLabels = {
  minimum: 'Minimum',
  maximum: 'Maximum',
};

type Orientation = 'horizontal' | 'vertical';
type Cap = 'edge' | 'gap' | 'seam';
type Tone = 'active' | 'inactive';

interface Bound {
  at: number;
  cap: Cap;
}

interface Segment {
  from: Bound;
  to: Bound;
  tone: Tone;
}

const maxAutoStops = 20;

const motionLevels = {
  system: 'full',
  reduced: 'reduced',
  disabled: 'none',
} as const;

function roundValue(value: number) {
  return Math.round(value * 1e9) / 1e9;
}

function along(fraction: number, clearance: 0 | 1 | 2) {
  return `calc(${clearance} * var(--slider-gap) + (100% - 2 * var(--slider-gap)) * ${fraction})`;
}

function boundOffset(bound: Bound, fraction: number, handles: number[]) {
  if (bound.cap === 'edge') return '0px';
  if (bound.cap === 'gap') return along(fraction, 2);
  const clearances = handles
    .filter((handle) => handle <= fraction)
    .map((handle) => along(handle, 2));
  if (clearances.length === 0) return along(fraction, 1);
  return `max(${[along(fraction, 1), ...clearances].join(', ')})`;
}

function axisStyle(orientation: Orientation, start: string, end: string): CSSProperties {
  return orientation === 'vertical'
    ? { bottom: start, top: end }
    : { insetInlineStart: start, insetInlineEnd: end };
}

function buildSegments(thumbs: number[], seam: number | null, active: [number, number]) {
  const cuts: Bound[] = thumbs.map((at) => ({ at, cap: 'gap' }));
  if (seam != null) cuts.push({ at: seam, cap: 'seam' });
  cuts.sort((a, b) => a.at - b.at);
  const bounds: Bound[] = [{ at: 0, cap: 'edge' }, ...cuts, { at: 1, cap: 'edge' }];
  return bounds.slice(1).map<Segment>((to, index) => {
    const from = bounds[index];
    const middle = (from.at + to.at) / 2;
    return {
      from,
      to,
      tone: middle >= active[0] && middle <= active[1] ? 'active' : 'inactive',
    };
  });
}

function gapMask(orientation: Orientation, direction: 'ltr' | 'rtl', thumbs: number[]) {
  const toward =
    orientation === 'vertical' ? 'to top' : direction === 'rtl' ? 'to left' : 'to right';
  const stops = thumbs.flatMap((fraction) => {
    const before = along(fraction, 0);
    const after = along(fraction, 2);
    return [`black ${before}`, `transparent ${before}`, `transparent ${after}`, `black ${after}`];
  });
  return `linear-gradient(${toward}, ${stops.join(', ')})`;
}

function normaliseMarks(marks: ReadonlyArray<number | SliderMark> | undefined, state: SliderState) {
  return (marks ?? []).map((mark) =>
    typeof mark === 'number' ? { value: mark, label: state.getFormattedValue(mark) } : mark,
  );
}

interface SliderBodyProps {
  styles: SliderSlots;
  orientation: Orientation;
  label?: ReactNode;
  description?: ReactNode;
  descriptionId: string;
  showValueLabel: boolean;
  showValueIndicator: boolean;
  showStops?: boolean;
  marks?: ReadonlyArray<number | SliderMark>;
  fillOffset?: number;
  thumbLabels?: ReadonlyArray<string | undefined>;
  labels?: Partial<SliderLabels>;
  name?: string;
  form?: string;
  minValue: number;
  maxValue: number;
  step: number;
}

function SliderBody({
  styles,
  orientation,
  label,
  description,
  descriptionId,
  showValueLabel,
  showValueIndicator,
  showStops,
  marks,
  fillOffset,
  thumbLabels,
  labels,
  name,
  form,
  minValue,
  maxValue,
  step,
}: SliderBodyProps) {
  const state = use(SliderStateContext);
  const direction = useDirection();
  const t = useLabels('slider', defaultSliderLabels, labels);
  if (!state) return null;

  const values = state.values;
  const isRange = values.length > 1;
  const isCollapsedRange = isRange && values.every((value) => value === values[0]);
  const thumbs = values.map((value) => state.getValuePercent(value));
  const offset = isRange
    ? minValue
    : Math.min(Math.max(fillOffset ?? minValue, minValue), maxValue);
  const activeValues: [number, number] = isRange
    ? [values[0], values[values.length - 1]]
    : [Math.min(offset, values[0]), Math.max(offset, values[0])];
  const offsetFraction = state.getValuePercent(offset);
  const seam =
    !isRange && offsetFraction > 0 && offsetFraction < 1 && offsetFraction !== thumbs[0]
      ? offsetFraction
      : null;
  const segments = buildSegments(thumbs, seam, [
    state.getValuePercent(activeValues[0]),
    state.getValuePercent(activeValues[1]),
  ]);

  const markList = normaliseMarks(marks, state).filter(
    (mark) => mark.value >= minValue && mark.value <= maxValue,
  );
  const intervals = (maxValue - minValue) / step;
  const canStop = Number.isFinite(intervals) && intervals > 0;
  const withStops = canStop && (showStops ?? (marks == null && intervals <= maxAutoStops));
  const stopValues = new Set<number>([maxValue]);
  if (isRange || offset > minValue) stopValues.add(minValue);
  if (withStops) {
    for (let index = 0; index <= Math.floor(intervals + 1e-9); index++) {
      stopValues.add(roundValue(minValue + index * step));
    }
  }
  for (const mark of markList) stopValues.add(roundValue(mark.value));

  const thumbStyle: CSSProperties | undefined =
    orientation === 'vertical' ? { transform: 'translateY(-50%)' } : undefined;
  const isVertical = orientation === 'vertical';

  function thumbLabel(index: number) {
    if (thumbLabels?.[index] != null) return thumbLabels[index];
    if (!isRange) return undefined;
    if (index === 0) return t.minimum;
    if (index === values.length - 1) return t.maximum;
    return undefined;
  }

  return (
    <>
      {label != null || showValueLabel ? (
        <div data-slot="header" className={styles.header()}>
          {label != null ? (
            <Label data-slot="label" className={styles.label()}>
              {label}
            </Label>
          ) : null}
          {showValueLabel ? (
            <SliderOutput data-slot="output" className={styles.output()}>
              {({ defaultChildren }) =>
                isCollapsedRange ? state.getThumbValueLabel(0) : defaultChildren
              }
            </SliderOutput>
          ) : null}
        </div>
      ) : null}
      <div data-slot="control" className={styles.control()}>
        <SliderTrack data-slot="track" className={styles.track()}>
          <div data-slot="rail" className={styles.rail()}>
            {segments.map((segment, index) => (
              <div
                key={index}
                data-slot="segment"
                data-tone={segment.tone}
                className={styles.segment({
                  tone: segment.tone,
                  startCap: segment.from.cap,
                  endCap: segment.to.cap,
                })}
                style={axisStyle(
                  orientation,
                  boundOffset(segment.from, segment.from.at, thumbs),
                  boundOffset(
                    segment.to,
                    1 - segment.to.at,
                    thumbs.map((thumb) => 1 - thumb),
                  ),
                )}
              />
            ))}
            <div
              data-slot="stops"
              className={styles.stops()}
              style={{ maskImage: gapMask(orientation, direction, thumbs) }}
            >
              {[...stopValues]
                .filter(
                  (value) => seam == null || Math.abs(state.getValuePercent(value) - seam) > 1e-9,
                )
                .sort((a, b) => a - b)
                .map((value) => {
                  const tone: Tone =
                    value >= activeValues[0] && value <= activeValues[1] ? 'active' : 'inactive';
                  const position = along(state.getValuePercent(value), 1);
                  return (
                    <span
                      key={value}
                      data-slot="stop"
                      data-tone={tone}
                      className={styles.stop({ tone })}
                      style={isVertical ? { bottom: position } : { insetInlineStart: position }}
                    />
                  );
                })}
            </div>
          </div>
          {values.map((value, index) => (
            <SliderThumb
              key={index}
              index={index}
              name={name}
              form={form}
              aria-label={thumbLabel(index)}
              data-slot="thumb"
              style={thumbStyle}
              className={styles.thumb({
                raised:
                  index < values.length - 1 &&
                  value === maxValue &&
                  values.indexOf(value) === index,
              })}
            >
              {showValueIndicator ? (
                <span aria-hidden="true" data-slot="value-indicator" className={styles.indicator()}>
                  <span data-slot="bubble" className={styles.bubble()}>
                    {state.getThumbValueLabel(index)}
                  </span>
                </span>
              ) : null}
            </SliderThumb>
          ))}
        </SliderTrack>
        {markList.some((mark) => mark.label != null) ? (
          <div data-slot="marks" className={styles.marks()}>
            {isVertical
              ? markList.map((mark) => (
                  <span key={`sizer-${mark.value}`} aria-hidden="true" className={styles.sizer()}>
                    {mark.label}
                  </span>
                ))
              : null}
            {markList.map((mark) => {
              if (mark.label == null) return null;
              const fraction = state.getValuePercent(mark.value);
              const align = isVertical
                ? 'center'
                : fraction <= 0
                  ? 'start'
                  : fraction >= 1
                    ? 'end'
                    : 'center';
              const style: CSSProperties = isVertical
                ? { bottom: `${fraction * 100}%` }
                : align === 'start'
                  ? { insetInlineStart: 'calc(-1 * var(--slider-gap))' }
                  : align === 'end'
                    ? { insetInlineEnd: 'calc(-1 * var(--slider-gap))' }
                    : { insetInlineStart: `${fraction * 100}%` };
              return (
                <span
                  key={mark.value}
                  data-slot="mark"
                  className={styles.mark({ markAlign: align })}
                  style={style}
                >
                  <span className={styles.markLabel()}>{mark.label}</span>
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
      {description != null ? (
        <span id={descriptionId} data-slot="description" className={styles.description()}>
          {description}
        </span>
      ) : null}
    </>
  );
}

export interface SliderProps<T extends number | number[] = number | number[]>
  extends Omit<AriaSliderProps<T>, 'children' | 'className' | 'render'>, SliderStyleProps {
  label?: ReactNode;
  description?: ReactNode;
  showValueLabel?: boolean;
  showValueIndicator?: boolean;
  showStops?: boolean;
  marks?: ReadonlyArray<number | SliderMark>;
  fillOffset?: number;
  thumbLabels?: ReadonlyArray<string | undefined>;
  labels?: Partial<SliderLabels>;
  name?: string;
  form?: string;
  className?: AriaSliderProps<T>['className'];
  ref?: Ref<HTMLDivElement>;
}

export function Slider<T extends number | number[]>({
  label,
  description,
  showValueLabel = true,
  showValueIndicator = true,
  showStops,
  marks,
  fillOffset,
  thumbLabels,
  labels,
  name,
  form,
  size = 'sm',
  orientation = 'horizontal',
  minValue = 0,
  maxValue = 100,
  step = 1,
  className,
  ...props
}: SliderProps<T>) {
  const direction = useDirection();
  const descriptionId = useId();
  const motion = motionLevels[useMotionPreference().preference];
  const styles = sliderStyles({ orientation, size, motion, direction });
  const describedBy =
    [description != null ? descriptionId : null, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <AriaSlider
      {...props}
      dir={direction}
      orientation={orientation}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      aria-describedby={describedBy}
      data-slot="slider"
      data-size={size}
      className={composeRenderProps(className, (className) => styles.root({ className }))}
      render={(domProps, { isDisabled }) => (
        <div {...domProps} aria-disabled={isDisabled || undefined} />
      )}
    >
      <SliderBody
        styles={styles}
        orientation={orientation}
        label={label}
        description={description}
        descriptionId={descriptionId}
        showValueLabel={showValueLabel}
        showValueIndicator={showValueIndicator}
        showStops={showStops}
        marks={marks}
        fillOffset={fillOffset}
        thumbLabels={thumbLabels}
        labels={labels}
        name={name}
        form={form}
        minValue={minValue}
        maxValue={maxValue}
        step={step}
      />
    </AriaSlider>
  );
}
