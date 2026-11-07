'use client';

import { useId, useMemo, useRef, type ComponentProps, type CSSProperties } from 'react';
import {
  areaPath,
  extent,
  linePath,
  numberFormatter,
  pointScale,
  type ChartCurve,
  type ChartPosition,
} from '@/registry/ds/lib/chart.ts';
import { motionEasings } from '@/registry/ds/lib/motion';
import { cn, tv } from '@/registry/ds/lib/utils';
import {
  ChartDataTable,
  chartColorClasses,
  useChartDirection,
  useChartLabels,
  useChartModel,
  useChartMotion,
  useChartReveal,
  type ChartCategory,
  type ChartCategoryFormatter,
  type ChartColor,
  type ChartLabels,
  type ChartSeries,
} from '@/registry/ds/ui/chart';

export type SparklineVariant = 'line' | 'area';

export interface SparklineProps extends Omit<
  ComponentProps<'div'>,
  'children' | 'color' | 'aria-label'
> {
  'aria-label': string;
  data: readonly (number | null)[];
  categories?: readonly ChartCategory[];
  variant?: SparklineVariant;
  color?: ChartColor;
  curve?: ChartCurve;
  showEndDot?: boolean;
  valueFormatOptions?: Intl.NumberFormatOptions;
  formatCategory?: ChartCategoryFormatter;
  categoryDirection?: 'auto' | 'ltr';
  isAnimated?: boolean;
  labels?: Partial<ChartLabels>;
}

export const sparklineStyles = tv({
  slots: {
    root: 'relative inline-block h-8 w-24 min-w-0 align-middle',
    figure: 'absolute inset-0',
    svg: 'absolute inset-0 size-full overflow-visible',
    line: 'fill-none stroke-(--chart-color) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]',
    area: 'stroke-none',
    dot: [
      'absolute size-1.5 rounded-full bg-(--chart-color)',
      'shadow-[0_0_0_2px_var(--chart-surface,var(--surface-raised))]',
    ],
  },
});

interface SparkDatum {
  category: ChartCategory;
  value: number | null;
}

export function Sparkline({
  data,
  categories,
  variant = 'line',
  color = 'primary',
  curve = 'monotone',
  showEndDot = true,
  valueFormatOptions,
  formatCategory,
  categoryDirection = 'auto',
  isAnimated = true,
  labels: labelsProp,
  className,
  style,
  'aria-label': ariaLabel,
  ...props
}: SparklineProps) {
  const t = useChartLabels(labelsProp);
  const descriptionId = useId();
  const gradientId = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const motion = useChartMotion(isAnimated);
  const revealed = useChartReveal(rootRef, motion.spatial);
  const { isReversed, bodyDir } = useChartDirection(categoryDirection);
  const rows = useMemo<SparkDatum[]>(
    () => data.map((value, index) => ({ category: categories?.[index] ?? index + 1, value })),
    [data, categories],
  );
  const series = useMemo<ChartSeries<SparkDatum>[]>(
    () => [{ id: 'value', label: ariaLabel, value: 'value', color }],
    [ariaLabel, color],
  );
  const model = useChartModel({
    data: rows,
    category: 'category',
    series,
    valueFormatOptions,
    formatCategory,
    marker: 'line',
    isStacked: false,
  });

  const geometry = useMemo(() => {
    const range = extent(data) ?? [0, 0];
    const [low, high] = range[0] === range[1] ? [range[0] - 1, range[1] + 1] : range;
    const scale = pointScale(data.length);
    const y = (value: number) => 0.12 + 0.76 * ((value - low) / (high - low));
    const points = data.map((value, index): ChartPosition | null =>
      value == null ? null : { x: scale.position(index) * 1000, y: (1 - y(value)) * 100 },
    );
    const floor = points.map((point) => (point ? { x: point.x, y: 100 } : null));
    let lastIndex = -1;
    data.forEach((value, index) => {
      if (value != null) lastIndex = index;
    });
    return {
      line: linePath(points, curve),
      area: variant === 'area' ? areaPath(points, floor, curve) : '',
      range,
      last:
        lastIndex >= 0 ? { x: scale.position(lastIndex), y: y(data[lastIndex] as number) } : null,
    };
  }, [data, curve, variant]);

  const formatter = numberFormatter(model.locale, valueFormatOptions);
  const defined = data.filter((value): value is number => value != null);
  const summary = defined.length
    ? t.format('trend', {
        first: formatter.format(defined[0]),
        last: formatter.format(defined[defined.length - 1]),
        min: formatter.format(geometry.range[0]),
        max: formatter.format(geometry.range[1]),
      })
    : t.noData;
  const styles = sparklineStyles();
  const ease = `cubic-bezier(${motionEasings.fluid.join(', ')})`;
  const reveal: CSSProperties | undefined = motion.spatial
    ? {
        clipPath: revealed
          ? 'inset(-10% -10% -10% -10%)'
          : isReversed
            ? 'inset(-10% -10% -10% 100%)'
            : 'inset(-10% 100% -10% -10%)',
        transition: `clip-path 700ms ${ease}`,
      }
    : undefined;

  return (
    <div
      {...props}
      ref={rootRef}
      dir={bodyDir}
      data-slot="sparkline"
      data-variant={variant}
      className={styles.root({ className: cn(chartColorClasses[color], className) })}
      style={style}
    >
      <div
        role="img"
        aria-label={ariaLabel}
        aria-describedby={descriptionId}
        className={styles.figure()}
        style={reveal}
      >
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden className={styles.svg()}>
          {variant === 'area' ? (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: 'var(--chart-color)', stopOpacity: 0.28 }} />
                <stop offset="100%" style={{ stopColor: 'var(--chart-color)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
          ) : null}
          <g transform={isReversed ? 'matrix(-1 0 0 1 1000 0)' : undefined}>
            {variant === 'area' ? (
              <path
                data-slot="area"
                d={geometry.area}
                className={styles.area()}
                fill={`url(#${gradientId})`}
              />
            ) : null}
            <path
              data-slot="line"
              d={geometry.line}
              vectorEffect="non-scaling-stroke"
              className={styles.line()}
            />
          </g>
        </svg>
        {showEndDot && geometry.last ? (
          <span
            aria-hidden
            data-slot="end-dot"
            className={styles.dot()}
            style={{
              insetInlineStart: `${geometry.last.x * 100}%`,
              bottom: `${geometry.last.y * 100}%`,
              translate: 'calc(var(--ds-direction, 1) * -50%) 50%',
            }}
          />
        ) : null}
      </div>
      <span id={descriptionId} hidden>
        {summary}
      </span>
      <ChartDataTable
        model={model}
        labels={t}
        caption={t.format('dataTable', { title: ariaLabel })}
        showTotal={false}
        isVisible={false}
      />
    </div>
  );
}
