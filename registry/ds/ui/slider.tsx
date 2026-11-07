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
    root: [
      'group/slider flex min-w-0 flex-col gap-1 [--slider-gap:calc(var(--slider-thumb)/2)]',
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 forced-colors:data-[disabled]:opacity-100',
    ],
    header: 'flex min-w-0 gap-x-3 gap-y-0.5',
    label:
      'min-w-0 cursor-default text-sm font-medium text-on-surface forced-colors:group-data-[disabled]/slider:text-[GrayText]',
    output:
      'shrink-0 text-sm text-on-surface-variant tabular-digits forced-colors:group-data-[disabled]/slider:text-[GrayText]',
    control: 'flex',
    track: 'relative shrink-0 cursor-pointer group-data-[disabled]/slider:cursor-not-allowed',
    rail: 'absolute overflow-hidden rounded-control forced-colors:forced-color-adjust-none',
    segment: 'absolute',
    stops: 'pointer-events-none absolute',
    stop: 'absolute size-(--slider-rail) rounded-full',
    thumb: [
      'focus-ring group/thumb absolute z-10 size-(--slider-thumb) cursor-grab rounded-full bg-surface-thumb shadow-sm',
      'data-[hovered]:shadow-md data-[dragging]:scale-90 data-[dragging]:cursor-grabbing data-[disabled]:cursor-not-allowed data-[disabled]:shadow-none',
      'forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none forced-colors:data-[disabled]:bg-[GrayText] forced-colors:data-[focus-visible]:outline-[Highlight]',
      "after:absolute after:-inset-1 after:rounded-full after:content-['']",
      'data-[dragging]:z-20 data-[focus-visible]:z-20',
      'transition-[scale,box-shadow] duration-150 ease-out motion-reduce:transition-none motion-reduce:data-[dragging]:scale-100',
    ],
    indicator: 'pointer-events-none absolute flex',
    bubble: [
      'flex h-7 min-w-9 shrink-0 items-center justify-center rounded-control bg-inverse-surface px-2.5 text-xs font-medium whitespace-nowrap text-inverse-on-surface tabular-digits shadow-md',
      'scale-90 opacity-0 transition-[opacity,scale] duration-150 ease-out motion-reduce:scale-100',
      'group-data-[dragging]/thumb:scale-100 group-data-[dragging]/thumb:opacity-100',
      'group-data-[focus-visible]/thumb:scale-100 group-data-[focus-visible]/thumb:opacity-100',
      'forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]',
    ],
    marks:
      'relative text-xs text-on-surface-variant select-none forced-colors:group-data-[disabled]/slider:text-[GrayText]',
    mark: 'absolute flex',
    markLabel: 'whitespace-nowrap',
    sizer: 'invisible col-start-1 row-start-1 whitespace-nowrap',
    description:
      'text-xs text-on-surface-variant forced-colors:group-data-[disabled]/slider:text-[GrayText]',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'w-full',
        header: 'items-baseline',
        output: 'ms-auto',
        control: 'flex-col gap-1',
        track: 'mx-(--slider-gap) h-(--slider-hit)',
        rail: '-inset-x-(--slider-gap) inset-y-0 my-auto h-(--slider-rail)',
        stops: '-inset-x-(--slider-gap) inset-y-0 my-auto h-(--slider-rail)',
        segment: 'inset-y-0',
        stop: '-ms-[calc(var(--slider-rail)/2)]',
        thumb: 'top-1/2',
        indicator: 'inset-x-0 bottom-full justify-center pb-2',
        marks: 'mx-(--slider-gap) h-4',
        mark: 'inset-y-0 w-0',
      },
      vertical: {
        root: 'h-60 w-fit items-center',
        header: 'flex-col items-center text-center',
        control: 'min-h-0 flex-1 gap-2',
        track: 'my-(--slider-gap) w-(--slider-hit)',
        rail: '-inset-y-(--slider-gap) inset-x-0 mx-auto w-(--slider-rail)',
        stops: '-inset-y-(--slider-gap) inset-x-0 mx-auto w-(--slider-rail)',
        segment: 'inset-x-0',
        stop: '-mb-[calc(var(--slider-rail)/2)]',
        thumb: 'inset-x-0 mx-auto',
        indicator: 'inset-y-0 inset-e-full items-center pe-2',
        bubble: 'origin-right',
        marks: 'my-(--slider-gap) grid content-start',
        mark: 'inset-s-0 h-0 items-center',
      },
    },
    size: {
      sm: { root: '[--slider-hit:1.5rem] [--slider-rail:0.25rem] [--slider-thumb:1rem]' },
      md: { root: '[--slider-hit:1.75rem] [--slider-rail:0.25rem] [--slider-thumb:1.25rem]' },
      lg: { root: '[--slider-hit:2rem] [--slider-rail:0.375rem] [--slider-thumb:1.5rem]' },
    },
    tone: {
      active: {
        segment:
          'bg-primary-solid forced-colors:bg-[Highlight] forced-colors:group-data-[disabled]/slider:bg-[GrayText]',
        stop: 'bg-on-primary-solid/70 forced-colors:bg-[HighlightText] forced-colors:group-data-[disabled]/slider:bg-[Canvas]',
      },
      inactive: {
        segment: [
          'bg-outline-variant',
          'forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:group-data-[disabled]/slider:border-[GrayText]',
        ],
        stop: 'bg-on-surface-variant/60 forced-colors:bg-[CanvasText] forced-colors:group-data-[disabled]/slider:bg-[GrayText]',
      },
    },
    markAlign: {
      start: { mark: 'justify-start' },
      center: { mark: 'justify-center' },
      end: { mark: 'justify-end' },
    },
    motion: {
      full: '',
      reduced: { thumb: 'transition-none data-[dragging]:scale-100', bubble: 'scale-100' },
      none: { thumb: 'transition-none data-[dragging]:scale-100', bubble: 'transition-none' },
    },
    direction: { ltr: '', rtl: '' },
    raised: { true: { thumb: 'z-11' }, false: '' },
  },
  compoundVariants: [
    { orientation: 'horizontal', class: { bubble: 'origin-bottom' } },
    { orientation: 'vertical', direction: 'rtl', class: { bubble: 'origin-left' } },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
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
type Tone = 'active' | 'inactive';

interface Segment {
  from: number;
  to: number;
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

function along(fraction: number) {
  return `calc(var(--slider-gap) + (100% - 2 * var(--slider-gap)) * ${fraction})`;
}

function boundOffset(fraction: number) {
  return fraction <= 0 ? '0px' : along(fraction);
}

function axisStyle(orientation: Orientation, start: string, end: string): CSSProperties {
  return orientation === 'vertical'
    ? { bottom: start, top: end }
    : { insetInlineStart: start, insetInlineEnd: end };
}

function buildSegments(cuts: number[], active: [number, number]) {
  const bounds = [0, ...[...cuts].sort((a, b) => a - b), 1];
  return bounds.slice(1).map<Segment>((to, index) => {
    const from = bounds[index];
    const middle = (from + to) / 2;
    return {
      from,
      to,
      tone: middle >= active[0] && middle <= active[1] ? 'active' : 'inactive',
    };
  });
}

function bubbleShift(fraction: number, direction: 'ltr' | 'rtl') {
  const toward = (0.5 - fraction) * (direction === 'rtl' ? -1 : 1);
  return `${toward} * (100% - var(--slider-thumb))`;
}

function bubbleStyle(fraction: number, direction: 'ltr' | 'rtl'): CSSProperties {
  const shift = bubbleShift(fraction, direction);
  return {
    translate: `calc(${shift}) 0`,
    transformOrigin: `calc(50% - ${shift}) 100%`,
  };
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
  const segments = buildSegments(seam == null ? thumbs : [...thumbs, seam], [
    state.getValuePercent(activeValues[0]),
    state.getValuePercent(activeValues[1]),
  ]);

  const markList = normaliseMarks(marks, state).filter(
    (mark) => mark.value >= minValue && mark.value <= maxValue,
  );
  const intervals = (maxValue - minValue) / step;
  const canStop = Number.isFinite(intervals) && intervals > 0;
  const withStops = canStop && (showStops ?? (marks == null && intervals <= maxAutoStops));
  const stopValues = new Set<number>();
  if (seam != null) stopValues.add(roundValue(offset));
  if (withStops) {
    for (let index = 0; index <= Math.floor(intervals + 1e-9); index++) {
      stopValues.add(roundValue(minValue + index * step));
    }
  }
  for (const mark of markList) stopValues.add(roundValue(mark.value));

  const isVertical = orientation === 'vertical';
  const thumbStyle: CSSProperties | undefined = isVertical
    ? { transform: 'translateY(-50%)' }
    : undefined;

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
                className={styles.segment({ tone: segment.tone })}
                style={axisStyle(
                  orientation,
                  boundOffset(segment.from),
                  boundOffset(1 - segment.to),
                )}
              />
            ))}
          </div>
          {stopValues.size > 0 ? (
            <div aria-hidden="true" data-slot="stops" className={styles.stops()}>
              {[...stopValues]
                .sort((a, b) => a - b)
                .map((value) => {
                  const tone: Tone =
                    value >= activeValues[0] && value <= activeValues[1] ? 'active' : 'inactive';
                  const position = along(state.getValuePercent(value));
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
          ) : null}
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
                  <span
                    data-slot="bubble"
                    className={styles.bubble()}
                    style={isVertical ? undefined : bubbleStyle(thumbs[index], direction)}
                  >
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
  size = 'md',
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
