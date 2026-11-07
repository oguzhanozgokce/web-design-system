'use client';

import { useId, useMemo, useRef, type CSSProperties } from 'react';
import {
  areaPath,
  axisFormatOptions,
  categoryTickPriority,
  isFiniteNumber,
  linePath,
  niceTicks,
  normalizeRows,
  numberFormatter,
  pointScale,
  type ChartCurve,
  type ChartPosition,
} from '@/registry/ds/lib/chart.ts';
import { motionEasings } from '@/registry/ds/lib/motion';
import { cn, tv } from '@/registry/ds/lib/utils';
import {
  ChartCategoryAxis,
  ChartGrid,
  ChartPointTooltip,
  ChartShell,
  ChartTooltipLayer,
  ChartValueAxis,
  chartColorClasses,
  chartPlotProps,
  chartStyles,
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

export type LineChartDots = 'none' | 'active' | 'all';

export type AreaChartLayout = 'overlap' | 'stacked' | 'percent';

export type AreaChartFill = 'gradient' | 'solid';

export interface LineChartProps<T> extends CartesianChartProps<T> {
  curve?: ChartCurve;
  dots?: LineChartDots;
}

export interface LineChartBaseProps<T> extends LineChartProps<T> {
  kind: 'line' | 'area';
  layout?: AreaChartLayout;
  fill?: AreaChartFill;
}

export const lineChartStyles = tv({
  slots: {
    svg: 'absolute inset-0 size-full overflow-visible',
    line: 'fill-none stroke-(--chart-color) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]',
    area: 'stroke-none',
    crosshair: [
      'pointer-events-none absolute inset-y-0 w-px bg-outline-variant opacity-0',
      'data-[visible]:opacity-100',
    ],
    dot: [
      'pointer-events-none absolute size-2 rounded-full bg-(--chart-color)',
      'shadow-[0_0_0_2px_var(--chart-surface,var(--surface-raised))]',
    ],
    activeDot: [
      'pointer-events-none absolute size-2.5 rounded-full bg-(--chart-color) opacity-0 data-[visible]:opacity-100',
      'shadow-[0_0_0_2px_var(--chart-surface,var(--surface-raised)),0_0_0_6px_color-mix(in_oklab,var(--chart-color)_22%,transparent)]',
    ],
    anchor: 'pointer-events-none absolute inset-y-0 w-0',
  },
});

const solidOpacity = { overlap: 0.14, stacked: 0.32, percent: 0.32 } as const;

function percent(fraction: number) {
  return `${Number((fraction * 100).toFixed(4))}%`;
}

export function LineChartBase<T>({
  kind,
  layout = 'overlap',
  fill = 'gradient',
  curve = 'monotone',
  dots = 'active',
  data,
  category,
  series,
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
}: LineChartBaseProps<T>) {
  const t = useChartLabels(labelsProp);
  const host = useChartHost();
  const isArea = kind === 'area';
  const isStacked = isArea && layout !== 'overlap';
  const model = useChartModel({
    data,
    category,
    series,
    palette,
    valueFormatOptions,
    formatCategory,
    marker: isArea ? 'square' : 'line',
    isStacked,
  });
  const { isReversed, bodyDir } = useChartDirection(categoryDirection);
  const motion = useChartMotion(isAnimated);
  const view = viewProp ?? host?.view ?? 'chart';
  const isInteractive = size !== 'sm';
  const tooltipMode = host?.readout ? 'none' : tooltip;
  const showValueAxis = (valueAxis?.isVisible ?? true) && size !== 'sm';
  const showCategoryAxis = (categoryAxis?.isVisible ?? true) && size !== 'sm';
  const gridVisible = (showGrid ?? true) && size !== 'sm';
  const legendPlacement = resolveLegend(legend, size, model.series.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const revealed = useChartReveal(rootRef, motion.spatial);
  const isPending = motion.spatial && !revealed;
  const gradientBase = useId().replace(/:/g, '');

  const interaction = useChartInteraction({
    model,
    axis: 'x',
    mode: 'point',
    isReversed,
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
    const scale = pointScale(count);
    const rows = layout === 'percent' && isArea ? normalizeRows(model.values) : model.values;
    const bottoms: (number | null)[][] = [];
    const tops: (number | null)[][] = [];
    const running = new Array<number>(count).fill(0);
    rows.forEach((row) => {
      bottoms.push(
        row.map((value, index) =>
          isFiniteNumber(value) ? (isStacked ? running[index] : 0) : null,
        ),
      );
      tops.push(
        row.map((value, index) => {
          if (!isFiniteNumber(value)) return null;
          if (!isStacked) return value;
          running[index] += value;
          return running[index];
        }),
      );
    });
    const flat = [...tops.flat(), ...(isStacked ? bottoms.flat() : [])].filter(isFiniteNumber);
    let low = Math.min(0, ...flat);
    let high = Math.max(0, ...flat);
    const [domainLow, domainHigh] = valueAxis?.domain ?? ['auto', 'auto'];
    if (domainLow !== 'auto') low = domainLow;
    if (domainHigh !== 'auto') high = domainHigh;
    const ticks = niceTicks(low, high, valueAxis?.tickCount ?? (size === 'lg' ? 5 : 4));
    const [d0, d1] =
      layout === 'percent' && isArea && domainLow === 'auto' && domainHigh === 'auto' && low >= 0
        ? [0, 1]
        : ticks.domain;
    const position = (value: number) => (value - d0) / (d1 - d0 || 1);
    const zero = Math.min(1, Math.max(0, position(0)));
    const floor = Math.min(d1, Math.max(d0, 0));
    const toPoint = (index: number, value: number): ChartPosition => ({
      x: scale.position(index) * 1000,
      y: (1 - position(value)) * 100,
    });

    const paths = model.series.map((entry, seriesIndex) => {
      const upper = tops[seriesIndex].map((value, index) =>
        value === null ? null : toPoint(index, value),
      );
      const lower = bottoms[seriesIndex].map((value, index) =>
        value === null ? null : toPoint(index, isStacked ? value : floor),
      );
      return {
        id: entry.id,
        line: linePath(upper, curve),
        area:
          isArea && (isStacked || entry.lineStyle !== 'dashed')
            ? areaPath(upper, lower, curve)
            : '',
      };
    });

    const base =
      valueAxis?.formatOptions ??
      (layout === 'percent' && isArea ? { style: 'percent' as const } : valueFormatOptions);
    const formatter = numberFormatter(
      model.locale,
      valueAxis?.formatOptions ?? axisFormatOptions(ticks.ticks, base),
    );
    const valueTicks: ChartTick[] = ticks.ticks
      .filter((tick) => tick >= d0 && tick <= d1)
      .map((tick) => ({
        key: String(tick),
        label: formatter.format(tick),
        position: position(tick),
      }));

    const tickMode = categoryAxis?.ticks ?? 'auto';
    const priorities = categoryTickPriority(count, tickMode);
    const categoryTicks: ChartTick[] = [];
    priorities.forEach((priority, index) => {
      if (priority === null) return;
      const fraction = scale.position(index);
      categoryTicks.push({
        key: String(index),
        label: model.axisLabels[index],
        position: fraction,
        priority,
        align:
          count > 1 && index === 0 ? 'start' : count > 1 && index === count - 1 ? 'end' : 'center',
      });
    });

    return {
      paths,
      valueTicks,
      categoryTicks,
      zero: d0 <= 0 && d1 >= 0 ? zero : null,
      x: (index: number) => scale.position(index),
      y: (seriesIndex: number, index: number) => {
        const value = tops[seriesIndex][index];
        return value === null ? null : position(value);
      },
    };
  }, [model, layout, isArea, isStacked, valueAxis, size, curve, valueFormatOptions, categoryAxis]);

  const styles = chartStyles();
  const lineStyles = lineChartStyles();
  const resolvedHeight =
    typeof height === 'number'
      ? `${height}px`
      : (height ?? (size === 'sm' ? '3rem' : size === 'lg' ? '18rem' : '12rem'));
  const showTooltip = isInteractive && tooltipMode !== 'none';
  const ease = `cubic-bezier(${motionEasings.fluid.join(', ')})`;
  const pathTransition = motion.spatial ? `d 450ms ${ease}` : undefined;
  const reveal = motion.spatial
    ? {
        clipPath: isReversed
          ? 'inset(0 0 0 calc((1 - var(--chart-grow, 1)) * 100%))'
          : 'inset(0 calc((1 - var(--chart-grow, 1)) * 100%) 0 0)',
        transition: `clip-path 700ms ${ease}`,
      }
    : undefined;
  const markIndex = activeIndex ?? shown.last;
  const glideTransition =
    shown.glide && motion.spatial
      ? `${springTransition(['inset-inline-start', 'bottom'])}, opacity 150ms ease-out`
      : motion.effects
        ? 'opacity 150ms ease-out'
        : 'none';
  const flip = isReversed ? 'matrix(-1 0 0 1 1000 0)' : undefined;

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
      showTotal={isStacked && model.series.length > 1}
      categoryLabel={categoryLabel}
      message={interaction.message}
      tableHeight={`calc(${resolvedHeight} + 1.5rem)`}
      palette={palette}
      monoColor={monoColor}
      isPending={isPending}
      className={className}
      style={style}
      dataSlot={isArea ? 'area-chart' : 'line-chart'}
      dataAttributes={{
        'data-size': size,
        'data-curve': curve,
        'data-layout': isArea ? layout : undefined,
      }}
    >
      {(ids) => (
        <div
          ref={rootRef}
          data-slot="chart-body"
          dir={bodyDir}
          className={cn(
            styles.body(),
            showValueAxis ? 'grid-cols-[auto_minmax(0,1fr)] pt-1.5' : 'grid-cols-[minmax(0,1fr)]',
          )}
        >
          {showValueAxis ? (
            <ChartValueAxis ticks={geometry.valueTicks} orientation="vertical" />
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
                orientation="vertical"
                baseline={size !== 'sm' ? geometry.zero : null}
                showLines={gridVisible}
              />
              <svg
                data-slot="chart-svg"
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
                className={lineStyles.svg()}
                style={reveal}
              >
                {isArea ? (
                  <defs>
                    {model.series.map((entry, seriesIndex) => (
                      <linearGradient
                        key={entry.id}
                        id={`${gradientBase}-${seriesIndex}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                        className={chartColorClasses[entry.color]}
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: 'var(--chart-color)', stopOpacity: 0.32 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: 'var(--chart-color)', stopOpacity: 0.02 }}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                ) : null}
                <g transform={flip}>
                  {isArea
                    ? geometry.paths.map((path, seriesIndex) =>
                        path.area ? (
                          <path
                            key={`area-${path.id}`}
                            data-slot="area"
                            d={path.area}
                            className={cn(
                              lineStyles.area(),
                              chartColorClasses[model.series[seriesIndex].color],
                            )}
                            fill={
                              fill === 'gradient' && !isStacked
                                ? `url(#${gradientBase}-${seriesIndex})`
                                : 'var(--chart-color)'
                            }
                            fillOpacity={
                              fill === 'gradient' && !isStacked ? undefined : solidOpacity[layout]
                            }
                            style={
                              {
                                d: `path("${path.area}")`,
                                transition: pathTransition,
                              } as CSSProperties
                            }
                          />
                        ) : null,
                      )
                    : null}
                  {geometry.paths.map((path, seriesIndex) => {
                    const entry = model.series[seriesIndex];
                    return (
                      <path
                        key={`line-${path.id}`}
                        data-slot="line"
                        data-series={entry.id}
                        d={path.line}
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray={entry.lineStyle === 'dashed' ? '5 5' : undefined}
                        className={cn(lineStyles.line(), chartColorClasses[entry.color])}
                        style={
                          { d: `path("${path.line}")`, transition: pathTransition } as CSSProperties
                        }
                      />
                    );
                  })}
                </g>
              </svg>
              {dots === 'all'
                ? model.series.flatMap((entry, seriesIndex) =>
                    model.categories.map((_, index) => {
                      const y = geometry.y(seriesIndex, index);
                      if (y === null) return null;
                      return (
                        <span
                          key={`${entry.id}-${index}`}
                          data-slot="dot"
                          className={cn(lineStyles.dot(), chartColorClasses[entry.color])}
                          style={{
                            insetInlineStart: percent(geometry.x(index)),
                            bottom: percent(y),
                            translate: 'calc(var(--ds-direction, 1) * -50%) 50%',
                            opacity: reveal ? 'var(--chart-grow, 1)' : undefined,
                            transition: reveal
                              ? `opacity 250ms ease-out ${Math.min(index * 20, 400) + 300}ms`
                              : undefined,
                          }}
                        />
                      );
                    }),
                  )
                : null}
              {model.categories.map((_, index) => (
                <span
                  key={index}
                  data-anchor={index}
                  className={lineStyles.anchor()}
                  style={{ insetInlineStart: percent(geometry.x(index)) }}
                />
              ))}
              {isInteractive && markIndex !== null ? (
                <>
                  <span
                    data-slot="crosshair"
                    data-visible={activeIndex !== null || undefined}
                    className={lineStyles.crosshair()}
                    style={{
                      insetInlineStart: percent(geometry.x(markIndex)),
                      translate: 'calc(var(--ds-direction, 1) * -50%) 0',
                      transition: glideTransition,
                    }}
                  />
                  {dots !== 'none'
                    ? model.series.map((entry, seriesIndex) => {
                        const y = geometry.y(seriesIndex, markIndex);
                        if (y === null) return null;
                        return (
                          <span
                            key={entry.id}
                            data-slot="active-dot"
                            data-series={entry.id}
                            data-visible={activeIndex !== null || undefined}
                            className={cn(lineStyles.activeDot(), chartColorClasses[entry.color])}
                            style={{
                              insetInlineStart: percent(geometry.x(markIndex)),
                              bottom: percent(y),
                              translate: 'calc(var(--ds-direction, 1) * -50%) 50%',
                              transition: glideTransition,
                            }}
                          />
                        );
                      })
                    : null}
                </>
              ) : null}
            </div>
            {showTooltip ? (
              <ChartTooltipLayer
                plotRef={interaction.plotRef}
                index={activeIndex}
                shownIndex={shown.last}
                glide={shown.glide}
                axis="x"
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
          {showValueAxis ? <span aria-hidden /> : null}
          {showCategoryAxis ? (
            <ChartCategoryAxis ticks={geometry.categoryTicks} orientation="vertical" />
          ) : null}
        </div>
      )}
    </ChartShell>
  );
}

export function LineChart<T>(props: LineChartProps<T>) {
  return <LineChartBase {...props} kind="line" />;
}
