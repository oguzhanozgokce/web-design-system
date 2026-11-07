'use client';

declare const process: { env: { NODE_ENV?: string } };

import { animate, motion, useMotionValue, type MotionValue } from 'motion/react';
import {
  createContext,
  memo,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useLocale } from 'react-aria-components';
import {
  formatCategory as formatCategoryValue,
  isFiniteNumber,
  numberFormatter,
  sum,
} from '@/registry/ds/lib/chart.ts';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { motionEasings, spatialSpring } from '@/registry/ds/lib/motion';
import { cn, tv } from '@/registry/ds/lib/utils';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export type ChartCategoricalColor =
  'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'chart-6' | 'chart-7' | 'chart-8';

export type ChartMonoColor = 'mono-1' | 'mono-2' | 'mono-3' | 'mono-4' | 'mono-5' | 'mono-6';

export type ChartColor =
  | 'primary'
  | 'neutral'
  | ChartCategoricalColor
  | ChartMonoColor
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type ChartPalette = 'categorical' | 'mono';

export type ChartMonoRole = 'primary' | 'neutral';

export type ChartMarker = 'square' | 'line' | 'dashed';

export type ChartTexture = 'none' | 'hatched';

export type ChartSize = 'sm' | 'md' | 'lg';

export type ChartCategory = string | number | Date;

export type ChartTooltipMode<T> = 'default' | 'none' | ((point: ChartPoint<T>) => ReactNode);

export type ChartView = 'chart' | 'table';

export type ChartLegendPlacement = 'top' | 'bottom' | 'none';

export interface ChartSeries<T> {
  id: string;
  label: string;
  value: keyof T | ((datum: T, index: number) => number | null | undefined);
  color?: ChartColor;
  texture?: ChartTexture;
  lineStyle?: 'solid' | 'dashed';
  isBelowBaseline?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
}

export interface ChartValueAxis {
  isVisible?: boolean;
  tickCount?: number;
  formatOptions?: Intl.NumberFormatOptions;
  domain?: [number | 'auto', number | 'auto'];
}

export interface ChartCategoryAxis {
  isVisible?: boolean;
  ticks?: 'all' | 'ends' | 'auto';
}

export interface ChartPointValue {
  id: string;
  label: string;
  color: ChartColor;
  texture: ChartTexture;
  marker: ChartMarker;
  isBelowBaseline: boolean;
  value: number | null;
  formatted: string;
}

export interface ChartPoint<T> {
  index: number;
  datum: T;
  category: ChartCategory;
  label: string;
  values: ChartPointValue[];
  total: number;
  formattedTotal: string;
  isStacked: boolean;
}

export interface ChartLabels {
  chart: string;
  roleDescription: string;
  dataTable: LabelTemplate<{ title: string }>;
  category: string;
  total: string;
  legend: string;
  summary: LabelTemplate<{ series: string; first: string; last: string }>;
  keyboardHint: string;
  pointAnnouncement: LabelTemplate<{ category: string; values: string }>;
  seriesValue: LabelTemplate<{ series: string; value: string }>;
  trend: LabelTemplate<{ first: string; last: string; min: string; max: string }>;
  noData: string;
}

export const defaultChartLabels: ChartLabels = {
  chart: 'Chart',
  roleDescription: 'chart',
  dataTable: 'Data for {title}',
  category: 'Category',
  total: 'Total',
  legend: 'Legend',
  summary: '{series}, {first} to {last}.',
  keyboardHint: 'Use the arrow keys to move between points.',
  pointAnnouncement: '{category}: {values}',
  seriesValue: '{series} {value}',
  trend: 'From {first} to {last}, lowest {min}, highest {max}.',
  noData: 'No data',
};

export function useChartLabels(labels?: Partial<ChartLabels>) {
  return useLabels('chart', defaultChartLabels, labels);
}

export type ChartLabelsApi = ReturnType<typeof useChartLabels>;

export const chartColorClasses: Record<ChartColor, string> = {
  primary: '[--chart-color:var(--primary)]',
  neutral:
    '[--chart-color:color-mix(in_oklab,var(--on-surface)_32%,var(--chart-surface,var(--surface-raised)))]',
  'chart-1': '[--chart-color:var(--chart-1)]',
  'chart-2': '[--chart-color:var(--chart-2)]',
  'chart-3': '[--chart-color:var(--chart-3)]',
  'chart-4': '[--chart-color:var(--chart-4)]',
  'chart-5': '[--chart-color:var(--chart-5)]',
  'chart-6': '[--chart-color:var(--chart-6)]',
  'chart-7': '[--chart-color:var(--chart-7)]',
  'chart-8': '[--chart-color:var(--chart-8)]',
  'mono-1': '[--chart-color:var(--chart-mono,var(--primary))]',
  'mono-2':
    '[--chart-color:color-mix(in_oklab,var(--chart-mono,var(--primary))_78%,var(--chart-surface,var(--surface-raised)))]',
  'mono-3':
    '[--chart-color:color-mix(in_oklab,var(--chart-mono,var(--primary))_60%,var(--chart-surface,var(--surface-raised)))]',
  'mono-4':
    '[--chart-color:color-mix(in_oklab,var(--chart-mono,var(--primary))_44%,var(--chart-surface,var(--surface-raised)))]',
  'mono-5':
    '[--chart-color:color-mix(in_oklab,var(--chart-mono,var(--primary))_32%,var(--chart-surface,var(--surface-raised)))]',
  'mono-6':
    '[--chart-color:color-mix(in_oklab,var(--chart-mono,var(--primary))_22%,var(--chart-surface,var(--surface-raised)))]',
  success: '[--chart-color:var(--success)]',
  warning: '[--chart-color:var(--warning)]',
  error: '[--chart-color:var(--error)]',
  info: '[--chart-color:var(--info)]',
};

export const chartMonoRoleClasses: Record<ChartMonoRole, string> = {
  primary: '[--chart-mono:var(--primary)]',
  neutral: '[--chart-mono:var(--on-surface)]',
};

export const chartTextureClass =
  'bg-[image:repeating-linear-gradient(-45deg,transparent_0_1.5px,var(--chart-surface,var(--surface-raised))_1.5px_3px)]';

export const chartDimmedFillClass =
  'bg-[color-mix(in_oklab,var(--chart-color)_38%,var(--chart-surface,var(--surface-raised)))]';

const categoricalOrder: ChartCategoricalColor[] = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'chart-6',
  'chart-7',
  'chart-8',
];

const monoOrder: ChartMonoColor[] = ['mono-1', 'mono-2', 'mono-3', 'mono-4', 'mono-5', 'mono-6'];

let warnedOverflow = false;

export function seriesColors(
  series: readonly Pick<ChartSeries<unknown>, 'color' | 'isBelowBaseline'>[],
  palette: ChartPalette = 'categorical',
): ChartColor[] {
  const main = series.filter((entry) => !entry.isBelowBaseline).length;
  let slot = 0;
  return series.map((entry) => {
    if (entry.isBelowBaseline) return entry.color ?? (palette === 'mono' ? 'mono-1' : 'error');
    const position = slot++;
    if (entry.color) return entry.color;
    if (palette === 'mono') return monoOrder[Math.min(position, monoOrder.length - 1)];
    if (main === 1) return 'primary';
    if (position >= categoricalOrder.length) {
      if (process.env.NODE_ENV !== 'production' && !warnedOverflow) {
        warnedOverflow = true;
        console.warn(
          'Charts have eight categorical colours. Fold the rest into an "Other" series or split the chart.',
        );
      }
      return 'neutral';
    }
    return categoricalOrder[position];
  });
}

export interface ChartHostValue {
  readout: boolean;
  view?: ChartView;
  labelledBy?: string;
  describedBy?: string;
  onActivePointChange?: (point: ChartPoint<unknown> | null) => void;
}

export const ChartHostContext = createContext<ChartHostValue | null>(null);

export function useChartHost() {
  return use(ChartHostContext);
}

export interface ResolvedChartSeries<T> {
  id: string;
  label: string;
  color: ChartColor;
  texture: ChartTexture;
  marker: ChartMarker;
  lineStyle: 'solid' | 'dashed';
  isBelowBaseline: boolean;
  read: (datum: T, index: number) => number | null;
  format: (value: number | null) => string;
}

export interface ChartModel<T> {
  count: number;
  data: readonly T[];
  categories: ChartCategory[];
  axisLabels: string[];
  detailLabels: string[];
  series: ResolvedChartSeries<T>[];
  values: (number | null)[][];
  totals: number[];
  formatTotal: (value: number) => string;
  locale: string;
  point: (index: number) => ChartPoint<T>;
}

export type ChartCategoryFormatter = (value: ChartCategory, context: 'axis' | 'detail') => string;

export interface ChartModelOptions<T> {
  data: readonly T[];
  category: keyof T | ((datum: T, index: number) => ChartCategory);
  series: readonly ChartSeries<T>[];
  palette?: ChartPalette;
  valueFormatOptions?: Intl.NumberFormatOptions;
  formatCategory?: ChartCategoryFormatter;
  marker: ChartMarker;
  isStacked: boolean;
}

function readCategory<T>(
  category: ChartModelOptions<T>['category'],
  datum: T,
  index: number,
): ChartCategory {
  if (typeof category === 'function') return category(datum, index);
  const value = datum[category] as unknown;
  if (value instanceof Date || typeof value === 'number') return value;
  return String(value ?? '');
}

function readValue<T>(series: ChartSeries<T>, datum: T, index: number): number | null {
  const raw =
    typeof series.value === 'function'
      ? series.value(datum, index)
      : (datum[series.value] as unknown);
  return isFiniteNumber(raw) ? raw : null;
}

const axisDate: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
const detailDate: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

export function useChartModel<T>({
  data,
  category,
  series,
  palette = 'categorical',
  valueFormatOptions,
  formatCategory,
  marker,
  isStacked,
}: ChartModelOptions<T>): ChartModel<T> {
  const { locale } = useLocale();
  return useMemo(() => {
    const colors = seriesColors(series, palette);
    const categories = data.map((datum, index) => readCategory(category, datum, index));
    const format = (value: ChartCategory, context: 'axis' | 'detail') =>
      formatCategory
        ? formatCategory(value, context)
        : formatCategoryValue(value, locale, { date: context === 'axis' ? axisDate : detailDate });
    const totalFormatter = numberFormatter(locale, valueFormatOptions);
    const resolved: ResolvedChartSeries<T>[] = series.map((entry, index) => {
      const formatter = numberFormatter(locale, entry.formatOptions ?? valueFormatOptions);
      const isBelowBaseline = Boolean(entry.isBelowBaseline);
      return {
        id: entry.id,
        label: entry.label,
        color: colors[index],
        texture: entry.texture ?? (isBelowBaseline && palette === 'mono' ? 'hatched' : 'none'),
        marker: entry.lineStyle === 'dashed' ? 'dashed' : marker,
        lineStyle: entry.lineStyle ?? 'solid',
        isBelowBaseline,
        read: (datum, datumIndex) => readValue(entry, datum, datumIndex),
        format: (value) => (value == null ? '–' : formatter.format(value)),
      };
    });
    const values = resolved.map((entry) => data.map((datum, index) => entry.read(datum, index)));
    const totals = data.map((_, index) =>
      sum(
        resolved.map((entry, seriesIndex) =>
          entry.isBelowBaseline ? null : values[seriesIndex][index],
        ),
      ),
    );
    const axisLabels = categories.map((value) => format(value, 'axis'));
    const detailLabels = categories.map((value) => format(value, 'detail'));
    return {
      count: data.length,
      data,
      categories,
      axisLabels,
      detailLabels,
      series: resolved,
      values,
      totals,
      locale,
      formatTotal: (value: number) => totalFormatter.format(value),
      point: (index: number): ChartPoint<T> => ({
        index,
        datum: data[index],
        category: categories[index],
        label: detailLabels[index],
        values: resolved.map((entry, seriesIndex) => ({
          id: entry.id,
          label: entry.label,
          color: entry.color,
          texture: entry.texture,
          marker: entry.marker,
          isBelowBaseline: entry.isBelowBaseline,
          value: values[seriesIndex][index],
          formatted: entry.format(values[seriesIndex][index]),
        })),
        total: totals[index],
        formattedTotal: totalFormatter.format(totals[index]),
        isStacked,
      }),
    };
  }, [
    data,
    category,
    series,
    palette,
    valueFormatOptions,
    formatCategory,
    marker,
    isStacked,
    locale,
  ]);
}

export function useChartReveal<E extends Element>(ref: RefObject<E | null>, isEnabled: boolean) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!isEnabled || revealed) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, isEnabled, revealed]);
  return !isEnabled || revealed;
}

export interface ChartMotion {
  spatial: boolean;
  effects: boolean;
  profile: ReturnType<typeof useMotionPreference>['profile'];
}

export function useChartMotion(isAnimated: boolean): ChartMotion {
  const { spatialEnabled, effectsEnabled, profile } = useMotionPreference();
  return { spatial: isAnimated && spatialEnabled, effects: effectsEnabled, profile };
}

interface ShownState {
  index: number | null;
  last: number | null;
  glide: boolean;
}

export function useShownIndex(activeIndex: number | null, count: number) {
  const [shown, setShown] = useState<ShownState>({
    index: activeIndex,
    last: activeIndex,
    glide: false,
  });
  if (shown.index !== activeIndex) {
    setShown({
      index: activeIndex,
      last: activeIndex ?? shown.last,
      glide: shown.index !== null && activeIndex !== null,
    });
  }
  const last = shown.last !== null && shown.last < count ? shown.last : null;
  return { index: activeIndex, last, glide: shown.glide && activeIndex !== null };
}

export interface ChartInteractionOptions<T> {
  model: ChartModel<T>;
  axis: 'x' | 'y';
  mode: 'band' | 'point';
  isReversed: boolean;
  isInteractive: boolean;
  activeIndex?: number | null;
  defaultActiveIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onAction?: (point: ChartPoint<T>) => void;
  labels: ChartLabelsApi;
}

export function describePoint<T>(point: ChartPoint<T>, labels: ChartLabelsApi, locale: string) {
  const list = new Intl.ListFormat(locale, { style: 'short', type: 'unit' });
  const parts = point.values
    .filter((entry) => entry.value != null)
    .map((entry) => labels.format('seriesValue', { series: entry.label, value: entry.formatted }));
  const mainCount = point.values.filter((entry) => !entry.isBelowBaseline).length;
  if (point.isStacked && mainCount > 1) {
    parts.unshift(
      labels.format('seriesValue', { series: labels.total, value: point.formattedTotal }),
    );
  }
  return labels.format('pointAnnouncement', {
    category: point.label,
    values: list.format(parts),
  });
}

export function useChartInteraction<T>({
  model,
  axis,
  mode,
  isReversed,
  isInteractive,
  activeIndex: activeIndexProp,
  defaultActiveIndex = null,
  onActiveIndexChange,
  onAction,
  labels,
}: ChartInteractionOptions<T>) {
  const [internal, setInternal] = useState<number | null>(defaultActiveIndex);
  const isControlled = activeIndexProp !== undefined;
  const raw = isControlled ? activeIndexProp : internal;
  const activeIndex = raw !== null && raw >= 0 && raw < model.count ? raw : null;
  const [message, setMessage] = useState('');
  const plotRef = useRef<HTMLDivElement>(null);
  const host = useChartHost();
  const onHostChange = host?.onActivePointChange;

  const setActive = useCallback(
    (next: number | null) => {
      if (next === activeIndex) return;
      if (!isControlled) setInternal(next);
      onActiveIndexChange?.(next);
    },
    [activeIndex, isControlled, onActiveIndexChange],
  );

  useEffect(() => {
    if (!onHostChange) return;
    onHostChange(activeIndex === null ? null : (model.point(activeIndex) as ChartPoint<unknown>));
  }, [activeIndex, model, onHostChange]);

  useEffect(() => {
    if (!onHostChange) return;
    return () => onHostChange(null);
  }, [onHostChange]);

  const indexAt = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const size = axis === 'x' ? rect.width : rect.height;
      if (!size || model.count === 0) return null;
      let fraction =
        axis === 'x' ? (event.clientX - rect.left) / size : (event.clientY - rect.top) / size;
      if (isReversed) fraction = 1 - fraction;
      fraction = Math.min(1, Math.max(0, fraction));
      if (mode === 'band') return Math.min(model.count - 1, Math.floor(fraction * model.count));
      return model.count <= 1 ? 0 : Math.round(fraction * (model.count - 1));
    },
    [axis, isReversed, mode, model.count],
  );

  const pick = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const index = indexAt(event);
      if (index !== null) setActive(index);
    },
    [indexAt, setActive],
  );

  const announce = useCallback(
    (index: number) => setMessage(describePoint(model.point(index), labels, model.locale)),
    [labels, model],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (model.count === 0) return;
      const forward = axis === 'x' ? (isReversed ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
      const backward = axis === 'x' ? (isReversed ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
      let next: number | null | undefined;
      switch (event.key) {
        case forward:
          next = activeIndex === null ? 0 : Math.min(model.count - 1, activeIndex + 1);
          break;
        case backward:
          next = activeIndex === null ? model.count - 1 : Math.max(0, activeIndex - 1);
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = model.count - 1;
          break;
        case 'Escape':
          if (activeIndex === null) return;
          next = null;
          break;
        case 'Enter':
        case ' ':
          if (activeIndex === null || !onAction) return;
          event.preventDefault();
          onAction(model.point(activeIndex));
          return;
        default:
          return;
      }
      event.preventDefault();
      setActive(next);
      if (next !== null) announce(next);
      else setMessage('');
    },
    [activeIndex, announce, axis, isReversed, model, onAction, setActive],
  );

  const plotProps = isInteractive
    ? {
        ref: plotRef,
        tabIndex: 0,
        onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
          if (event.pointerType !== 'mouse') {
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {}
          }
          pick(event);
        },
        onPointerMove: pick,
        onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
          if (event.pointerType !== 'mouse') {
            try {
              event.currentTarget.releasePointerCapture(event.pointerId);
            } catch {}
            setActive(null);
          }
        },
        onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
          if (event.pointerType === 'mouse') setActive(null);
        },
        onPointerCancel: () => setActive(null),
        onClick: (event: MouseEvent<HTMLDivElement>) => {
          if (!onAction) return;
          const index = indexAt(event);
          if (index !== null) onAction(model.point(index));
        },
        onKeyDown,
        onBlur: () => {
          setActive(null);
          setMessage('');
        },
      }
    : { ref: plotRef };

  return { activeIndex, setActiveIndex: setActive, plotRef, plotProps, message };
}

export function useGlide(
  isAnimated: boolean,
  profile: ChartMotion['profile'],
): [MotionValue<number>, MotionValue<number>, (x: number, y: number, glide: boolean) => void] {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const move = useCallback(
    (nextX: number, nextY: number, glide: boolean) => {
      if (!glide || !isAnimated) {
        x.set(nextX);
        y.set(nextY);
        return;
      }
      const spring = spatialSpring('medium', profile);
      animate(x, nextX, spring);
      animate(y, nextY, spring);
    },
    [isAnimated, profile, x, y],
  );
  return [x, y, move];
}

export const chartStyles = tv({
  slots: {
    root: '@container/chart relative flex w-full min-w-0 flex-col gap-3 text-on-surface',
    body: 'grid min-w-0 gap-x-2 gap-y-2',
    plot: 'focus-ring no-tap-highlight relative min-w-0 rounded-sm select-none',
    valueAxis: 'relative text-xs leading-none text-on-surface-variant tabular-nums',
    valueAxisSizer: 'invisible grid h-0 overflow-hidden',
    valueTick: 'absolute whitespace-nowrap',
    categoryAxis: 'relative text-xs leading-none text-on-surface-variant tabular-nums',
    categoryTick: 'absolute whitespace-nowrap',
    gridLine: 'pointer-events-none absolute bg-outline-subtle',
    baseline: 'pointer-events-none absolute bg-outline-variant',
    srOnly: 'sr-only',
  },
});

export interface ChartTick {
  key: string;
  label: string;
  position: number;
  priority?: 0 | 1;
  align?: 'start' | 'center' | 'end';
  offset?: string;
}

function ruleStyle(position: number, orientation: 'vertical' | 'horizontal'): CSSProperties {
  return orientation === 'vertical'
    ? { bottom: `${position * 100}%`, translate: '0 50%' }
    : {
        insetInlineStart: `${position * 100}%`,
        translate: 'calc(var(--ds-direction, 1) * -50%) 0',
      };
}

export function ChartGrid({
  ticks,
  orientation,
  baseline,
  showLines,
}: {
  ticks: readonly ChartTick[];
  orientation: 'vertical' | 'horizontal';
  baseline: number | null;
  showLines: boolean;
}) {
  const styles = chartStyles();
  return (
    <>
      {showLines
        ? ticks.map((tick) =>
            baseline !== null && Math.abs(tick.position - baseline) < 1e-9 ? null : (
              <span
                key={tick.key}
                aria-hidden
                data-slot="grid-line"
                className={cn(
                  styles.gridLine(),
                  orientation === 'vertical' ? 'inset-x-0 h-px' : 'inset-y-0 w-px',
                )}
                style={ruleStyle(tick.position, orientation)}
              />
            ),
          )
        : null}
      {baseline !== null ? (
        <span
          aria-hidden
          data-slot="baseline"
          className={cn(
            styles.baseline(),
            orientation === 'vertical' ? 'inset-x-0 h-px' : 'inset-y-0 w-px',
          )}
          style={ruleStyle(baseline, orientation)}
        />
      ) : null}
    </>
  );
}

export function ChartValueAxis({
  ticks,
  orientation,
}: {
  ticks: readonly ChartTick[];
  orientation: 'vertical' | 'horizontal';
}) {
  const styles = chartStyles();
  if (orientation === 'vertical') {
    return (
      <div aria-hidden data-slot="value-axis" className={styles.valueAxis()}>
        <div className={styles.valueAxisSizer()}>
          {ticks.map((tick) => (
            <span key={tick.key} className="[grid-area:1/1]">
              {tick.label}
            </span>
          ))}
        </div>
        {ticks.map((tick) => (
          <span
            key={tick.key}
            data-slot="value-tick"
            className={cn(styles.valueTick(), 'inset-e-0 translate-y-1/2')}
            style={{ bottom: `${tick.position * 100}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden data-slot="value-axis" className={cn(styles.valueAxis(), 'h-3')}>
      {ticks.map((tick) => (
        <span
          key={tick.key}
          data-slot="value-tick"
          className={cn(styles.valueTick(), 'top-0', tick.priority === 1 && '@max-md/chart:hidden')}
          style={tickStyle(tick, `${tick.position * 100}%`)}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}

function tickStyle(tick: ChartTick, start: string): CSSProperties {
  const align = tick.align ?? 'center';
  return {
    insetInlineStart: start,
    translate:
      align === 'start'
        ? undefined
        : `calc(var(--ds-direction, 1) * ${align === 'end' ? '-100%' : '-50%'}) 0`,
  };
}

export function ChartCategoryAxis({
  ticks,
  orientation,
}: {
  ticks: readonly ChartTick[];
  orientation: 'vertical' | 'horizontal';
}) {
  const styles = chartStyles();
  if (orientation === 'vertical') {
    return (
      <div aria-hidden data-slot="category-axis" className={cn(styles.categoryAxis(), 'h-3')}>
        {ticks.map((tick) => (
          <span
            key={tick.key}
            data-slot="category-tick"
            className={cn(
              styles.categoryTick(),
              'top-0',
              tick.priority === 1 && '@max-md/chart:hidden',
            )}
            style={tickStyle(tick, tick.offset ?? `${tick.position * 100}%`)}
          >
            {tick.label}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden data-slot="category-axis" className={styles.categoryAxis()}>
      <div className={styles.valueAxisSizer()}>
        {ticks.map((tick) => (
          <span key={tick.key} className="max-w-32 truncate [grid-area:1/1]">
            {tick.label}
          </span>
        ))}
      </div>
      {ticks.map((tick) => (
        <span
          key={tick.key}
          data-slot="category-tick"
          className={cn(styles.categoryTick(), 'inset-e-0 max-w-32 -translate-y-1/2 truncate')}
          style={{ top: tick.offset ?? `${tick.position * 100}%` }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}

export const chartMarkerStyles = tv({
  base: 'inline-block shrink-0',
  variants: {
    marker: {
      square: 'size-2.5 rounded-[0.1875rem] bg-(--chart-color)',
      line: 'h-0.5 w-3 rounded-full bg-(--chart-color)',
      dashed:
        'h-0.5 w-3.5 bg-[repeating-linear-gradient(to_right,var(--chart-color)_0_4px,transparent_4px_5px)]',
    },
    texture: {
      none: '',
      hatched: chartTextureClass,
    },
  },
  defaultVariants: { marker: 'square', texture: 'none' },
});

export interface ChartMarkerProps extends Omit<ComponentProps<'span'>, 'color'> {
  color: ChartColor;
  marker?: ChartMarker;
  texture?: ChartTexture;
}

export function ChartMarkerSwatch({
  color,
  marker = 'square',
  texture = 'none',
  className,
  ...props
}: ChartMarkerProps) {
  return (
    <span
      aria-hidden
      data-slot="marker"
      {...props}
      className={chartMarkerStyles({
        marker,
        texture: marker === 'square' ? texture : 'none',
        className: cn(chartColorClasses[color], className),
      })}
    />
  );
}

export interface ChartLegendItem {
  id: string;
  label: string;
  color: ChartColor;
  marker?: ChartMarker;
  texture?: ChartTexture;
}

export const chartLegendStyles = tv({
  slots: {
    root: 'flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant',
    item: 'inline-flex min-w-0 items-center gap-1.5',
    label: 'min-w-0 truncate',
  },
});

export interface ChartLegendProps extends Omit<ComponentProps<'ul'>, 'children'> {
  items: readonly ChartLegendItem[];
  labels?: Partial<ChartLabels>;
}

export function ChartLegend({ items, labels, className, ...props }: ChartLegendProps) {
  const t = useChartLabels(labels);
  const styles = chartLegendStyles();
  return (
    <ul
      aria-label={t.legend}
      {...props}
      data-slot="chart-legend"
      className={styles.root({ className })}
    >
      {items.map((item) => (
        <li key={item.id} data-slot="legend-item" className={styles.item()}>
          <ChartMarkerSwatch color={item.color} marker={item.marker} texture={item.texture} />
          <span className={styles.label()}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export interface ChartTooltipItem {
  id: string;
  label: string;
  value: ReactNode;
  color: ChartColor;
  marker?: ChartMarker;
  texture?: ChartTexture;
}

export const chartTooltipStyles = tv({
  slots: {
    root: [
      'flex w-max max-w-72 min-w-36 flex-col gap-1 rounded-xl bg-surface-overlay px-3 py-2 text-xs text-on-surface shadow-md',
      'forced-colors:border',
    ],
    header: 'mb-0.5 flex items-baseline justify-between gap-4 whitespace-nowrap',
    title: 'text-on-surface-variant',
    total: 'font-semibold tabular-nums',
    row: 'flex items-center gap-2 whitespace-nowrap',
    label: 'min-w-0 flex-1 truncate text-on-surface-variant',
    value: 'font-medium tabular-nums',
  },
});

export interface ChartTooltipProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: ReactNode;
  total?: ReactNode;
  items: readonly ChartTooltipItem[];
}

export function ChartTooltip({ title, total, items, className, ...props }: ChartTooltipProps) {
  const styles = chartTooltipStyles();
  return (
    <div {...props} data-slot="chart-tooltip" className={styles.root({ className })}>
      {title != null || total != null ? (
        <div data-slot="tooltip-header" className={styles.header()}>
          <span className={styles.title()}>{title}</span>
          {total != null ? <span className={styles.total()}>{total}</span> : null}
        </div>
      ) : null}
      {items.map((item) => (
        <div key={item.id} data-slot="tooltip-row" className={styles.row()}>
          <ChartMarkerSwatch color={item.color} marker={item.marker} texture={item.texture} />
          <span className={styles.label()}>{item.label}</span>
          <span className={styles.value()}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartPointTooltip<T>({ point }: { point: ChartPoint<T> }) {
  const main = point.values.filter((entry) => !entry.isBelowBaseline);
  const showTotal = point.isStacked && main.length > 1;
  return (
    <ChartTooltip
      title={point.label}
      total={showTotal ? point.formattedTotal : undefined}
      items={point.values.map((entry) => ({
        id: entry.id,
        label: entry.label,
        value: entry.formatted,
        color: entry.color,
        marker: entry.marker,
        texture: entry.texture,
      }))}
    />
  );
}

export interface ChartTooltipLayerProps {
  plotRef: RefObject<HTMLDivElement | null>;
  index: number | null;
  shownIndex: number | null;
  glide: boolean;
  axis: 'x' | 'y';
  isAnimated: boolean;
  profile: ChartMotion['profile'];
  children: ReactNode;
}

export function ChartTooltipLayer({
  plotRef,
  index,
  shownIndex,
  glide,
  axis,
  isAnimated,
  profile,
  children,
}: ChartTooltipLayerProps) {
  const tipRef = useRef<HTMLDivElement>(null);
  const [x, y, move] = useGlide(isAnimated, profile);
  const { direction } = useLocale();

  useLayoutEffect(() => {
    const plot = plotRef.current;
    const tip = tipRef.current;
    if (index === null || !plot || !tip) return;
    const anchor = plot.querySelector<HTMLElement>(`[data-anchor="${index}"]`);
    if (!anchor) return;
    const plotRect = plot.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const isRtl = getComputedStyle(plot).direction === 'rtl';
    const gap = 8;
    let nextX = 0;
    let nextY = 0;
    if (axis === 'x') {
      const after = anchorRect.right - plotRect.left + gap;
      const before = anchorRect.left - plotRect.left - gap - width;
      const fitsAfter = after + width <= plotRect.width;
      const fitsBefore = before >= 0;
      if (isRtl) nextX = fitsBefore || !fitsAfter ? before : after;
      else nextX = fitsAfter || !fitsBefore ? after : before;
      nextX = Math.max(0, Math.min(plotRect.width - width, nextX));
    } else {
      const marks = [...anchor.querySelectorAll<HTMLElement>('[data-slot="bar-segment"]')].map(
        (mark) => mark.getBoundingClientRect(),
      );
      const markLeft = marks.length ? Math.min(...marks.map((mark) => mark.left)) : anchorRect.left;
      const markRight = marks.length
        ? Math.max(...marks.map((mark) => mark.right))
        : anchorRect.right;
      const centred = anchorRect.top + anchorRect.height / 2 - plotRect.top - height / 2;
      const afterEnd = isRtl
        ? markLeft - plotRect.left - gap - width
        : markRight - plotRect.left + gap;
      const fitsEnd = isRtl ? afterEnd >= 0 : afterEnd + width <= plotRect.width;
      if (fitsEnd) {
        nextX = afterEnd;
        nextY = centred;
      } else {
        const below = anchorRect.bottom - plotRect.top + gap;
        const above = anchorRect.top - plotRect.top - gap - height;
        nextY = below + height <= plotRect.height || above < 0 ? below : above;
        nextX = isRtl ? markLeft - plotRect.left : markRight - plotRect.left - width;
      }
      nextX = Math.max(0, Math.min(plotRect.width - width, nextX));
      nextY = Math.max(0, Math.min(Math.max(0, plotRect.height - height), nextY));
    }
    move(nextX, nextY, glide);
  }, [axis, direction, glide, index, move, plotRef, shownIndex, children]);

  return (
    <motion.div
      ref={tipRef}
      aria-hidden
      data-slot="tooltip-layer"
      data-visible={index !== null || undefined}
      className={cn(
        'pointer-events-none absolute z-10 opacity-0 data-[visible]:opacity-100',
        isAnimated && 'transition-opacity duration-150 ease-out',
      )}
      style={{ left: 0, top: 0, x, y }}
    >
      {shownIndex !== null ? children : null}
    </motion.div>
  );
}

export function ChartLiveRegion({ message }: { message: string }) {
  return (
    <div aria-live="polite" aria-atomic="true" data-slot="chart-live" className="sr-only">
      {message}
    </div>
  );
}

export const chartDataTableStyles = tv({
  slots: {
    scroller: 'min-w-0 overflow-auto rounded-item focus-ring outline-offset-0',
    table: 'w-full border-collapse text-sm',
    caption: 'sr-only',
    headCell:
      'sticky top-0 bg-(--chart-surface,var(--surface-raised)) px-3 py-2 text-xs font-medium whitespace-nowrap text-on-surface-variant',
    rowHead: 'px-3 py-2 text-start font-normal whitespace-nowrap text-on-surface',
    cell: 'px-3 py-2 text-end whitespace-nowrap tabular-nums text-on-surface',
    row: 'border-t border-outline-subtle',
  },
});

export interface ChartDataTableProps<T> {
  model: ChartModel<T>;
  labels: ChartLabelsApi;
  caption: string | null;
  labelledBy?: string;
  categoryLabel?: string;
  showTotal: boolean;
  isVisible: boolean;
  maxHeight?: string;
}

export function ChartDataTable<T>({
  model,
  labels,
  caption,
  labelledBy,
  categoryLabel,
  showTotal,
  isVisible,
  maxHeight,
}: ChartDataTableProps<T>) {
  const styles = chartDataTableStyles();
  const table = (
    <table
      data-slot="chart-table"
      className={styles.table()}
      aria-labelledby={caption === null ? labelledBy : undefined}
    >
      {caption !== null ? <caption className={styles.caption()}>{caption}</caption> : null}
      <thead>
        <tr>
          <th scope="col" className={cn(styles.headCell(), 'text-start')}>
            {categoryLabel ?? labels.category}
          </th>
          {model.series.map((entry) => (
            <th key={entry.id} scope="col" className={cn(styles.headCell(), 'text-end')}>
              {entry.label}
            </th>
          ))}
          {showTotal ? (
            <th scope="col" className={cn(styles.headCell(), 'text-end')}>
              {labels.total}
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {model.categories.map((_, index) => (
          <tr key={index} className={isVisible ? styles.row() : undefined}>
            <th scope="row" className={isVisible ? styles.rowHead() : undefined}>
              {model.detailLabels[index]}
            </th>
            {model.series.map((entry, seriesIndex) => (
              <td key={entry.id} className={isVisible ? styles.cell() : undefined}>
                {entry.format(model.values[seriesIndex][index])}
              </td>
            ))}
            {showTotal ? (
              <td className={isVisible ? cn(styles.cell(), 'font-medium') : undefined}>
                {model.formatTotal(model.totals[index])}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
  if (!isVisible) return <div className="sr-only">{table}</div>;
  return (
    <div
      data-slot="chart-table-view"
      role="region"
      tabIndex={0}
      aria-label={caption ?? undefined}
      aria-labelledby={caption === null ? labelledBy : undefined}
      className={styles.scroller()}
      style={{ maxHeight }}
    >
      {table}
    </div>
  );
}

const MemoChartDataTable = memo(ChartDataTable) as typeof ChartDataTable;

export interface ChartNameProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface ChartShellProps<T> extends ChartNameProps {
  model: ChartModel<T>;
  labels: ChartLabelsApi;
  description?: string;
  legend: ChartLegendPlacement;
  legendItems: ChartLegendItem[];
  view: ChartView;
  isInteractive: boolean;
  showTotal: boolean;
  categoryLabel?: string;
  message: string;
  tableHeight?: string;
  palette: ChartPalette;
  monoColor: ChartMonoRole;
  isPending: boolean;
  className?: string;
  style?: CSSProperties;
  dataSlot: string;
  dataAttributes?: Record<string, string | boolean | undefined>;
  children: (ids: { labelId: string | undefined; descriptionId: string }) => ReactNode;
}

export function useChartName({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: ChartNameProps) {
  const host = useChartHost();
  const labelledBy = ariaLabelledby ?? (ariaLabel ? undefined : host?.labelledBy);
  return { ariaLabel, labelledBy, hostDescribedBy: host?.describedBy };
}

export function ChartShell<T>({
  model,
  labels,
  description,
  legend,
  legendItems,
  view,
  isInteractive,
  showTotal,
  categoryLabel,
  message,
  tableHeight,
  palette,
  monoColor,
  isPending,
  className,
  style,
  dataSlot,
  dataAttributes,
  children,
  ...nameProps
}: ChartShellProps<T>) {
  const descriptionId = useId();
  const { ariaLabel, labelledBy, hostDescribedBy } = useChartName(nameProps);
  const fallbackName = !ariaLabel && !labelledBy ? labels.chart : undefined;
  const seriesList = useMemo(
    () =>
      new Intl.ListFormat(model.locale, { style: 'long', type: 'conjunction' }).format(
        model.series.map((entry) => entry.label),
      ),
    [model.locale, model.series],
  );
  const summary =
    model.count > 0
      ? labels.format('summary', {
          series: seriesList,
          first: model.detailLabels[0],
          last: model.detailLabels[model.count - 1],
        })
      : labels.noData;
  const descriptionText = [description, summary, isInteractive ? labels.keyboardHint : null]
    .filter(Boolean)
    .join(' ');
  const caption = ariaLabel
    ? labels.format('dataTable', { title: ariaLabel })
    : fallbackName
      ? labels.format('dataTable', { title: fallbackName })
      : null;
  const legendNode =
    legend !== 'none' && view === 'chart' ? (
      <ChartLegend items={legendItems} labels={{ legend: labels.legend }} />
    ) : null;

  return (
    <div
      data-slot={dataSlot}
      data-view={view}
      data-palette={palette}
      data-pending={isPending || undefined}
      {...dataAttributes}
      className={cn(
        chartStyles().root(),
        chartMonoRoleClasses[monoColor],
        '[@media(scripting:enabled)]:data-[pending]:[--chart-grow:0]',
        className,
      )}
      style={style}
    >
      {legend === 'top' ? legendNode : null}
      {view === 'table' ? (
        <MemoChartDataTable
          model={model}
          labels={labels}
          caption={caption}
          labelledBy={labelledBy}
          categoryLabel={categoryLabel}
          showTotal={showTotal}
          isVisible
          maxHeight={tableHeight}
        />
      ) : (
        children({
          labelId: labelledBy,
          descriptionId: [descriptionId, hostDescribedBy, nameProps['aria-describedby']]
            .filter(Boolean)
            .join(' '),
        })
      )}
      {legend === 'bottom' ? legendNode : null}
      <span id={descriptionId} hidden>
        {descriptionText}
      </span>
      {view === 'chart' ? (
        <MemoChartDataTable
          model={model}
          labels={labels}
          caption={caption}
          labelledBy={labelledBy}
          categoryLabel={categoryLabel}
          showTotal={showTotal}
          isVisible={false}
        />
      ) : null}
      <ChartLiveRegion message={message} />
    </div>
  );
}

export function chartPlotProps(
  nameProps: ChartNameProps,
  labels: ChartLabelsApi,
  ids: { labelId: string | undefined; descriptionId: string },
  isInteractive: boolean,
) {
  const name = nameProps['aria-label']
    ? { 'aria-label': nameProps['aria-label'] }
    : ids.labelId
      ? { 'aria-labelledby': ids.labelId }
      : { 'aria-label': labels.chart };
  return {
    role: isInteractive ? 'group' : 'img',
    'aria-roledescription': isInteractive ? labels.roleDescription : undefined,
    'aria-describedby': ids.descriptionId,
    ...name,
  };
}

export const chartPlotHeights: Record<ChartSize, string> = {
  sm: '3rem',
  md: '12rem',
  lg: '18rem',
};

export function resolveHeight(height: number | string | undefined, size: ChartSize) {
  if (typeof height === 'number') return `${height}px`;
  return height ?? chartPlotHeights[size];
}

export interface CartesianChartProps<T> extends ChartNameProps {
  data: readonly T[];
  category: keyof T | ((datum: T, index: number) => ChartCategory);
  series: readonly ChartSeries<T>[];
  description?: string;
  formatCategory?: ChartCategoryFormatter;
  categoryLabel?: string;
  valueFormatOptions?: Intl.NumberFormatOptions;
  valueAxis?: ChartValueAxis;
  categoryAxis?: ChartCategoryAxis;
  categoryDirection?: 'auto' | 'ltr';
  showGrid?: boolean;
  legend?: ChartLegendPlacement;
  tooltip?: ChartTooltipMode<T>;
  activeIndex?: number | null;
  defaultActiveIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onAction?: (point: ChartPoint<T>) => void;
  size?: ChartSize;
  height?: number | string;
  palette?: ChartPalette;
  monoColor?: ChartMonoRole;
  isAnimated?: boolean;
  view?: ChartView;
  labels?: Partial<ChartLabels>;
  className?: string;
  style?: CSSProperties;
}

export function useChartDirection(categoryDirection: 'auto' | 'ltr' = 'auto') {
  const { direction } = useLocale();
  const isPinned = categoryDirection === 'ltr' && direction === 'rtl';
  return {
    isReversed: direction === 'rtl' && !isPinned,
    bodyDir: isPinned ? ('ltr' as const) : undefined,
  };
}

export function legendItemsOf<T>(model: ChartModel<T>): ChartLegendItem[] {
  return model.series.map((entry) => ({
    id: entry.id,
    label: entry.label,
    color: entry.color,
    marker: entry.marker,
    texture: entry.texture,
  }));
}

export function resolveLegend(
  legend: ChartLegendPlacement | undefined,
  size: ChartSize,
  seriesCount: number,
): ChartLegendPlacement {
  if (size === 'sm') return 'none';
  return legend ?? (seriesCount > 1 ? 'bottom' : 'none');
}

export function geometryTransition(
  properties: readonly string[],
  delay: number,
  motion: ChartMotion,
  duration = 600,
) {
  const parts: string[] = [];
  if (motion.spatial) {
    const ease = `cubic-bezier(${motionEasings.fluid.join(', ')})`;
    for (const property of properties) parts.push(`${property} ${duration}ms ${ease} ${delay}ms`);
  }
  if (motion.effects) parts.push('background-color 150ms ease-out');
  return parts.length ? parts.join(', ') : 'none';
}

export const springTransition = (properties: readonly string[]) =>
  properties
    .map((property) => `${property} var(--ds-duration-spatial) var(--ds-ease-spatial)`)
    .join(', ');
