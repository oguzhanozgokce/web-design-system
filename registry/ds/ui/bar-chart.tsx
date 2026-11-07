'use client';

import { useMemo, useRef, type CSSProperties } from 'react';
import {
  axisFormatOptions,
  categoryTickPriority,
  isFiniteNumber,
  niceTicks,
  normalizeRows,
  numberFormatter,
  stack,
} from '@/registry/ds/lib/chart.ts';
import { cn, tv } from '@/registry/ds/lib/utils';
import {
  ChartCategoryAxis,
  ChartGrid,
  ChartPointTooltip,
  ChartShell,
  ChartTooltipLayer,
  ChartValueAxis,
  chartColorClasses,
  chartDimmedFillClass,
  chartPlotProps,
  chartStyles,
  chartTextureClass,
  geometryTransition,
  legendItemsOf,
  resolveLegend,
  springTransition,
  useChartDirection,
  useChartHost,
  useChartInteraction,
  useChartLabels,
  useChartModel,
  useChartMotion,
  useChartReveal,
  useShownIndex,
  type CartesianChartProps,
  type ChartTick,
} from '@/registry/ds/ui/chart';

export type BarChartLayout = 'grouped' | 'stacked' | 'percent';

export type BarChartOrientation = 'vertical' | 'horizontal';

export type BarChartRadius = 'none' | 'sm' | 'full';

export interface BarChartProps<T> extends CartesianChartProps<T> {
  layout?: BarChartLayout;
  orientation?: BarChartOrientation;
  barGap?: number;
  maxBarSize?: number;
  radius?: BarChartRadius;
  showTrack?: boolean;
}

const lift = 2;
const innerGap = 2;
const ringOffset = 3;
const belowShare = 0.18;

const radii: Record<BarChartRadius, string> = {
  none: '[--chart-radius:0px]',
  sm: '[--chart-radius:0.25rem]',
  full: '[--chart-radius:9999px]',
};

const rowSizes = { sm: 1.25, md: 2, lg: 2.5 } as const;

export const barChartStyles = tv({
  slots: {
    group: 'pointer-events-none absolute flex',
    bar: 'relative min-w-0 flex-1',
    below: 'absolute inset-0',
    track: 'absolute rounded-[var(--chart-radius)] bg-neutral-soft',
    segment: 'absolute rounded-[var(--chart-radius)]',
    ring: [
      'pointer-events-none absolute rounded-[calc(var(--chart-radius)+3px)] border-[1.5px] border-outline opacity-0',
      'data-[visible]:opacity-100 forced-colors:border-[Highlight]',
    ],
  },
  variants: {
    orientation: {
      vertical: {
        group: 'inset-y-0 gap-0.5',
        bar: 'h-full',
        track: 'inset-x-0',
        segment: 'inset-x-0',
      },
      horizontal: {
        group: 'inset-x-0 flex-col gap-0.5',
        bar: 'w-full',
        track: 'inset-y-0',
        segment: 'inset-y-0',
      },
    },
  },
});

function percent(fraction: number) {
  return `${Number((fraction * 100).toFixed(4))}%`;
}

interface Span {
  low: number;
  high: number;
  insetLow: number;
  insetHigh: number;
}

function spanCss(span: Span, anchor: number) {
  const start = `(${percent(span.low)} + ${span.insetLow}px)`;
  const size = `max(2px, calc(${percent(span.high - span.low)} - ${span.insetLow + span.insetHigh}px))`;
  return {
    start: `calc(${percent(anchor)} + var(--chart-grow, 1) * (${start} - ${percent(anchor)}))`,
    size: `calc(var(--chart-grow, 1) * ${size})`,
  };
}

interface SegmentGeometry {
  key: string;
  seriesIndex: number;
  start: string;
  size: string;
}

interface BarGeometry {
  segments: SegmentGeometry[];
  track: { start: string; size: string } | null;
}

interface ColumnGeometry {
  bars: BarGeometry[];
  below: SegmentGeometry[];
  ring: { start: string; size: string };
}

function stackSpans(
  entries: { seriesIndex: number; start: number; end: number }[],
  position: (value: number) => number,
) {
  const positive = entries
    .filter((entry) => entry.end > entry.start)
    .sort((a, b) => a.start - b.start);
  const negative = entries
    .filter((entry) => entry.end < entry.start)
    .sort((a, b) => b.start - a.start);
  const spans: { seriesIndex: number; span: Span }[] = [];
  positive.forEach((entry, order) => {
    spans.push({
      seriesIndex: entry.seriesIndex,
      span: {
        low: position(entry.start),
        high: position(entry.end),
        insetLow: order === 0 ? lift : innerGap / 2,
        insetHigh: order === positive.length - 1 ? 0 : innerGap / 2,
      },
    });
  });
  negative.forEach((entry, order) => {
    spans.push({
      seriesIndex: entry.seriesIndex,
      span: {
        low: position(entry.end),
        high: position(entry.start),
        insetLow: order === negative.length - 1 ? 0 : innerGap / 2,
        insetHigh: order === 0 ? lift : innerGap / 2,
      },
    });
  });
  return spans;
}

export function BarChart<T>({
  data,
  category,
  series,
  layout = 'grouped',
  orientation = 'vertical',
  barGap = 6,
  maxBarSize = 24,
  radius = 'sm',
  showTrack = false,
  description,
  formatCategory,
  categoryLabel,
  valueFormatOptions,
  valueAxis,
  categoryAxis,
  categoryDirection = 'auto',
  showGrid,
  legend,
  tooltip = 'default',
  activeIndex: activeIndexProp,
  defaultActiveIndex,
  onActiveIndexChange,
  onAction,
  size = 'md',
  height,
  palette = 'categorical',
  monoColor = 'primary',
  isAnimated = true,
  view: viewProp,
  labels: labelsProp,
  className,
  style,
  ...nameProps
}: BarChartProps<T>) {
  const t = useChartLabels(labelsProp);
  const host = useChartHost();
  const isStacked = layout !== 'grouped';
  const model = useChartModel({
    data,
    category,
    series,
    palette,
    valueFormatOptions,
    formatCategory,
    marker: 'square',
    isStacked,
  });
  const isVertical = orientation === 'vertical';
  const { isReversed, bodyDir } = useChartDirection(isVertical ? categoryDirection : 'auto');
  const motion = useChartMotion(isAnimated);
  const view = viewProp ?? host?.view ?? 'chart';
  const isInteractive = size !== 'sm';
  const tooltipMode = host?.readout ? 'none' : tooltip;
  const showValueAxis = (valueAxis?.isVisible ?? true) && size !== 'sm';
  const showCategoryAxis = (categoryAxis?.isVisible ?? true) && size !== 'sm';
  const gridVisible = (showGrid ?? !showTrack) && size !== 'sm';
  const legendPlacement = resolveLegend(legend, size, model.series.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const revealed = useChartReveal(rootRef, motion.spatial);
  const isPending = motion.spatial && !revealed;

  const interaction = useChartInteraction({
    model,
    axis: isVertical ? 'x' : 'y',
    mode: 'band',
    isReversed: isVertical && isReversed,
    isInteractive,
    activeIndex: activeIndexProp,
    defaultActiveIndex,
    onActiveIndexChange,
    onAction,
    labels: t,
  });
  const { activeIndex } = interaction;
  const shown = useShownIndex(activeIndex, model.count);

  const geometry = useMemo(() => {
    const count = model.count;
    const mainIndices = model.series
      .map((entry, index) => (entry.isBelowBaseline ? -1 : index))
      .filter((index) => index >= 0);
    const belowIndices = model.series
      .map((entry, index) => (entry.isBelowBaseline ? index : -1))
      .filter((index) => index >= 0);
    const mainRows = mainIndices.map((index) => model.values[index]);
    const rows = layout === 'percent' ? normalizeRows(mainRows) : mainRows;
    const stacked = isStacked ? stack(rows) : null;
    const flat = rows.flat().filter(isFiniteNumber);
    let low = stacked ? stacked.min : Math.min(0, ...flat);
    let high = stacked ? stacked.max : Math.max(0, ...flat);
    if (layout === 'percent') {
      low = Math.min(0, low);
      high = Math.max(high, low < 0 ? 0 : 1);
    }
    const [domainLow, domainHigh] = valueAxis?.domain ?? ['auto', 'auto'];
    if (domainLow !== 'auto') low = domainLow;
    if (domainHigh !== 'auto') high = domainHigh;
    const ticks = niceTicks(low, high, valueAxis?.tickCount ?? (size === 'lg' ? 5 : 4));
    const [d0, d1] =
      layout === 'percent' && domainLow === 'auto' && domainHigh === 'auto' && low >= 0
        ? [0, 1]
        : ticks.domain;
    const belowStack = belowIndices.length
      ? stack(
          belowIndices.map((index) =>
            model.values[index].map((value) => (value == null ? null : Math.abs(value))),
          ),
        )
      : null;
    const belowMax = belowStack ? belowStack.max : 0;
    const share = belowMax > 0 ? belowShare : 0;
    const position = (value: number) =>
      share + (1 - share) * ((Math.min(d1, Math.max(d0, value)) - d0) / (d1 - d0 || 1));
    const zero = position(0);
    const barsPerGroup = isStacked ? 1 : Math.max(1, mainIndices.length);
    const groupMax = barsPerGroup * maxBarSize + (barsPerGroup - 1) * innerGap;

    const columns: ColumnGeometry[] = [];
    for (let index = 0; index < count; index++) {
      const bars: BarGeometry[] = [];
      let highest = zero;
      let lowest = zero;
      const trackLow = d0 < 0 ? position(d0) : zero;
      const staticTrack = showTrack
        ? {
            start: `calc(${percent(trackLow)} + ${d0 < 0 ? 0 : lift}px)`,
            size: `calc(${percent(1 - trackLow)} - ${d0 < 0 ? 0 : lift}px)`,
          }
        : null;
      if (stacked) {
        const entries = mainIndices
          .map((seriesIndex, row) => {
            const segment = stacked.segments[row][index];
            return segment ? { seriesIndex, start: segment.start, end: segment.end } : null;
          })
          .filter(
            (entry): entry is { seriesIndex: number; start: number; end: number } => entry !== null,
          );
        const spans = stackSpans(entries, position);
        bars.push({
          track: staticTrack,
          segments: spans.map(({ seriesIndex, span }) => ({
            key: model.series[seriesIndex].id,
            seriesIndex,
            ...spanCss(span, zero),
          })),
        });
        highest = position(stacked.positiveTotals[index]);
        lowest = position(stacked.negativeTotals[index]);
      } else {
        mainIndices.forEach((seriesIndex, row) => {
          const value = rows[row][index];
          const segments: SegmentGeometry[] = [];
          if (isFiniteNumber(value) && value !== 0) {
            const [span] = stackSpans([{ seriesIndex, start: 0, end: value }], position);
            segments.push({
              key: model.series[seriesIndex].id,
              seriesIndex,
              ...spanCss(span.span, zero),
            });
            highest = Math.max(highest, position(value));
            lowest = Math.min(lowest, position(value));
          }
          bars.push({ track: staticTrack, segments });
        });
      }
      const below: SegmentGeometry[] = [];
      if (belowStack && belowMax > 0) {
        const depth = (value: number) => share - (value / belowMax) * share;
        const entries = belowIndices
          .map((seriesIndex, row) => {
            const segment = belowStack.segments[row][index];
            return segment ? { seriesIndex, segment } : null;
          })
          .filter(
            (entry): entry is { seriesIndex: number; segment: { start: number; end: number } } =>
              entry !== null,
          );
        entries.forEach(({ seriesIndex, segment }, order) => {
          below.push({
            key: model.series[seriesIndex].id,
            seriesIndex,
            ...spanCss(
              {
                low: depth(segment.end),
                high: depth(segment.start),
                insetLow: order === entries.length - 1 ? 0 : innerGap / 2,
                insetHigh: order === 0 ? lift : innerGap / 2,
              },
              share,
            ),
          });
        });
        if (entries.length) lowest = Math.min(lowest, depth(belowStack.positiveTotals[index]));
      }
      if (showTrack) highest = 1;
      const liftAtLow = lowest === zero && d0 >= 0 ? lift : 0;
      columns.push({
        bars,
        below,
        ring: {
          start: `calc(${percent(lowest)} + ${liftAtLow - ringOffset}px)`,
          size: `calc(${percent(highest - lowest)} + ${2 * ringOffset - liftAtLow}px)`,
        },
      });
    }

    const base =
      valueAxis?.formatOptions ??
      (layout === 'percent' ? { style: 'percent' as const } : valueFormatOptions);
    const formatter = numberFormatter(
      model.locale,
      valueAxis?.formatOptions ?? axisFormatOptions(ticks.ticks, base),
    );
    const shownTicks = ticks.ticks.filter((tick) => tick >= d0 && tick <= d1);
    const zeroOrder = Math.max(0, shownTicks.indexOf(0));
    const thinOut = !isVertical && shownTicks.length > 4;
    const valueTicks: ChartTick[] = shownTicks.map((tick, order, list) => ({
      key: String(tick),
      label: formatter.format(tick),
      position: position(tick),
      priority: thinOut && Math.abs(order - zeroOrder) % 2 === 1 ? 1 : 0,
      align: isVertical
        ? undefined
        : order === 0 && position(tick) <= 0.001
          ? 'start'
          : order === list.length - 1 && position(tick) >= 0.999
            ? 'end'
            : 'center',
    }));

    const n = Math.max(1, count);
    const slot = `((100% - ${n - 1} * var(--chart-gap)) / ${n})`;
    const group = `min(${slot}, ${groupMax}px)`;
    const groupStart = (index: number) =>
      `calc(${index} * (${slot} + var(--chart-gap)) + (${slot} - ${group}) / 2)`;
    const center = (index: number) => `calc(${index} * (${slot} + var(--chart-gap)) + ${slot} / 2)`;
    const tickMode = categoryAxis?.ticks ?? 'auto';
    const priorities = categoryTickPriority(
      count,
      isVertical ? tickMode : tickMode === 'ends' ? 'ends' : 'all',
    );
    const categoryTicks: ChartTick[] = [];
    priorities.forEach((priority, index) => {
      if (priority === null) return;
      const isFirstEnd = tickMode === 'ends' && index === 0 && count > 1;
      const isLastEnd = tickMode === 'ends' && index === count - 1 && count > 1;
      categoryTicks.push({
        key: String(index),
        label: model.axisLabels[index],
        position: 0,
        priority,
        align: isVertical ? (isFirstEnd ? 'start' : isLastEnd ? 'end' : 'center') : undefined,
        offset:
          isVertical && isFirstEnd
            ? groupStart(0)
            : isVertical && isLastEnd
              ? `calc(${groupStart(index)} + ${group})`
              : center(index),
      });
    });

    return {
      columns,
      valueTicks,
      categoryTicks,
      zero,
      hasBaseline: !(showTrack && d0 >= 0) || share > 0,
      gap: n > 1 ? `min(${barGap}px, max(1px, (100% - ${3 * n}px) / ${n - 1}))` : '0px',
      groupStart,
      group,
      barsPerGroup,
    };
  }, [
    model,
    layout,
    isStacked,
    valueAxis,
    size,
    maxBarSize,
    showTrack,
    valueFormatOptions,
    isVertical,
    categoryAxis,
    barGap,
  ]);

  const styles = chartStyles();
  const barStyles = barChartStyles({ orientation });
  const plotHeight =
    typeof height === 'number'
      ? `${height}px`
      : (height ?? (isVertical ? undefined : `${Math.max(1, model.count) * rowSizes[size]}rem`));
  const resolvedHeight = plotHeight ?? (size === 'sm' ? '3rem' : size === 'lg' ? '18rem' : '12rem');
  const startProperty = isVertical ? 'bottom' : 'inset-inline-start';
  const sizeProperty = isVertical ? 'height' : 'width';
  const showTooltip = isInteractive && tooltipMode !== 'none';

  const placeAlongValue = (start: string, extent: string): CSSProperties =>
    isVertical ? { bottom: start, height: extent } : { insetInlineStart: start, width: extent };
  const placeAlongCategory = (index: number): CSSProperties =>
    isVertical
      ? { insetInlineStart: geometry.groupStart(index), width: geometry.group }
      : { top: geometry.groupStart(index), height: geometry.group };

  const ringTransition =
    shown.glide && motion.spatial
      ? `${springTransition([isVertical ? 'inset-inline-start' : 'top', startProperty, sizeProperty])}, opacity 150ms ease-out`
      : motion.effects
        ? 'opacity 150ms ease-out'
        : 'none';
  const ringIndex = activeIndex ?? shown.last;

  return (
    <ChartShell
      {...nameProps}
      model={model}
      labels={t}
      description={description}
      legend={legendPlacement}
      legendItems={legendItemsOf(model)}
      view={view}
      isInteractive={isInteractive}
      showTotal={isStacked && model.series.filter((entry) => !entry.isBelowBaseline).length > 1}
      categoryLabel={categoryLabel}
      message={interaction.message}
      tableHeight={`calc(${resolvedHeight} + 1.5rem)`}
      palette={palette}
      monoColor={monoColor}
      isPending={isPending}
      className={cn(radii[radius], className)}
      style={style}
      dataSlot="bar-chart"
      dataAttributes={{
        'data-layout': layout,
        'data-orientation': orientation,
        'data-size': size,
        'data-track': showTrack || undefined,
      }}
    >
      {(ids) => (
        <div
          ref={rootRef}
          data-slot="chart-body"
          dir={bodyDir}
          className={cn(
            styles.body(),
            isVertical
              ? showValueAxis
                ? 'grid-cols-[auto_minmax(0,1fr)] pt-1.5'
                : 'grid-cols-[minmax(0,1fr)]'
              : showCategoryAxis
                ? 'grid-cols-[auto_minmax(0,1fr)]'
                : 'grid-cols-[minmax(0,1fr)]',
          )}
          style={{ '--chart-gap': geometry.gap } as CSSProperties}
        >
          {isVertical && showValueAxis ? (
            <ChartValueAxis ticks={geometry.valueTicks} orientation="vertical" />
          ) : null}
          {!isVertical && showCategoryAxis ? (
            <ChartCategoryAxis ticks={geometry.categoryTicks} orientation="horizontal" />
          ) : null}
          <div
            {...interaction.plotProps}
            {...chartPlotProps(nameProps, t, ids, isInteractive)}
            data-slot="plot"
            data-active={activeIndex !== null || undefined}
            className={cn(styles.plot(), 'touch-pan-y', onAction && 'cursor-pointer')}
            style={{ height: resolvedHeight }}
          >
            <div aria-hidden className="absolute inset-0">
              <ChartGrid
                ticks={geometry.valueTicks}
                orientation={isVertical ? 'vertical' : 'horizontal'}
                baseline={geometry.hasBaseline && size !== 'sm' ? geometry.zero : null}
                showLines={gridVisible}
              />
              {geometry.columns.map((column, index) => {
                const isDimmed = activeIndex !== null && activeIndex !== index;
                const delay = Math.min(index * 14, 320);
                const segmentClass = (seriesIndex: number) => {
                  const entry = model.series[seriesIndex];
                  return cn(
                    barStyles.segment(),
                    chartColorClasses[entry.color],
                    isDimmed ? chartDimmedFillClass : 'bg-(--chart-color)',
                    entry.texture === 'hatched' && chartTextureClass,
                  );
                };
                const transition = geometryTransition([startProperty, sizeProperty], delay, motion);
                return (
                  <div
                    key={index}
                    data-slot="bar-group"
                    data-anchor={index}
                    data-index={index}
                    data-active={activeIndex === index || undefined}
                    className={barStyles.group()}
                    style={placeAlongCategory(index)}
                  >
                    {column.bars.map((bar, barIndex) => (
                      <div key={barIndex} data-slot="bar" className={barStyles.bar()}>
                        {bar.track ? (
                          <span
                            data-slot="bar-track"
                            className={barStyles.track()}
                            style={placeAlongValue(bar.track.start, bar.track.size)}
                          />
                        ) : null}
                        {bar.segments.map((segment) => (
                          <span
                            key={segment.key}
                            data-slot="bar-segment"
                            data-series={segment.key}
                            className={segmentClass(segment.seriesIndex)}
                            style={{ ...placeAlongValue(segment.start, segment.size), transition }}
                          />
                        ))}
                      </div>
                    ))}
                    {column.below.length ? (
                      <div data-slot="bar-below" className={barStyles.below()}>
                        {column.below.map((segment) => (
                          <span
                            key={segment.key}
                            data-slot="bar-segment"
                            data-series={segment.key}
                            className={segmentClass(segment.seriesIndex)}
                            style={{ ...placeAlongValue(segment.start, segment.size), transition }}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {isInteractive && ringIndex !== null && geometry.columns[ringIndex] ? (
                <span
                  data-slot="bar-ring"
                  data-visible={activeIndex !== null || undefined}
                  className={barStyles.ring()}
                  style={{
                    ...(isVertical
                      ? {
                          insetInlineStart: `calc(${geometry.groupStart(ringIndex)} - ${ringOffset}px)`,
                          width: `calc(${geometry.group} + ${2 * ringOffset}px)`,
                        }
                      : {
                          top: `calc(${geometry.groupStart(ringIndex)} - ${ringOffset}px)`,
                          height: `calc(${geometry.group} + ${2 * ringOffset}px)`,
                        }),
                    ...placeAlongValue(
                      geometry.columns[ringIndex].ring.start,
                      geometry.columns[ringIndex].ring.size,
                    ),
                    transition: ringTransition,
                  }}
                />
              ) : null}
            </div>
            {showTooltip ? (
              <ChartTooltipLayer
                plotRef={interaction.plotRef}
                index={activeIndex}
                shownIndex={shown.last}
                glide={shown.glide}
                axis={isVertical ? 'x' : 'y'}
                isAnimated={motion.spatial}
                profile={motion.profile}
              >
                {shown.last !== null ? (
                  typeof tooltipMode === 'function' ? (
                    tooltipMode(model.point(shown.last))
                  ) : (
                    <ChartPointTooltip point={model.point(shown.last)} />
                  )
                ) : null}
              </ChartTooltipLayer>
            ) : null}
          </div>
          {isVertical && showValueAxis ? <span aria-hidden /> : null}
          {isVertical && showCategoryAxis ? (
            <ChartCategoryAxis ticks={geometry.categoryTicks} orientation="vertical" />
          ) : null}
          {!isVertical && showCategoryAxis ? <span aria-hidden /> : null}
          {!isVertical && showValueAxis ? (
            <ChartValueAxis ticks={geometry.valueTicks} orientation="horizontal" />
          ) : null}
        </div>
      )}
    </ChartShell>
  );
}
