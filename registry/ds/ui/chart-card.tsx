'use client';

import { useCallback, useId, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { useLocale, type Key } from 'react-aria-components';
import { useControllableState } from '@/registry/ds/hooks/use-controllable-state';
import { numberFormatter } from '@/registry/ds/lib/chart.ts';
import type { LabelTemplate } from '@/registry/ds/lib/labels';
import { cn, tv } from '@/registry/ds/lib/utils';
import {
  Card,
  CardDescription,
  CardTitle,
  type CardTitleLevel,
  type CardVariant,
} from '@/registry/ds/ui/card';
import {
  ChartHostContext,
  type ChartHostValue,
  type ChartPoint,
  type ChartView,
} from '@/registry/ds/ui/chart';
import { ContentState, type ContentStatus } from '@/registry/ds/ui/content-state';
import { useIcons, useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { IconToggleButton } from '@/registry/ds/ui/icon-button';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Skeleton } from '@/registry/ds/ui/skeleton';
import { Tag, type TagTone } from '@/registry/ds/ui/tag';

export interface ChartCardLabels {
  increase: LabelTemplate<{ value: string }>;
  decrease: LabelTemplate<{ value: string }>;
  noChange: string;
  period: string;
  total: string;
  showTable: string;
  loading: string;
  emptyTitle: string;
}

export const defaultChartCardLabels: ChartCardLabels = {
  increase: 'Up {value}',
  decrease: 'Down {value}',
  noChange: 'No change',
  period: 'Period',
  total: 'Total',
  showTable: 'Show as table',
  loading: 'Loading chart',
  emptyTitle: 'No data for this period',
};

export type ChartCardPolarity = 'increase-is-good' | 'decrease-is-good' | 'neutral';

export type ChartCardReadout = 'tooltip' | 'headline';

export interface ChartCardDelta {
  value: number;
  formatOptions?: Intl.NumberFormatOptions;
  polarity?: ChartCardPolarity;
}

export interface ChartCardPeriod {
  id: Key;
  label: string;
}

export const chartCardStyles = tv({
  slots: {
    root: 'gap-4 [--chart-surface:var(--surface-raised)]',
    header: 'flex flex-wrap items-start gap-x-3 gap-y-3',
    heading: 'flex min-w-0 flex-1 basis-40 flex-col gap-1',
    controls: '-my-0.5 flex max-w-full shrink-0 items-center gap-1.5',
    headline: 'flex min-w-0 flex-col gap-1',
    caption: 'min-h-4 truncate text-xs text-on-surface-variant',
    figure: 'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1',
    value: 'text-3xl font-semibold tracking-tight text-on-surface',
    unit: 'text-sm text-on-surface-variant',
    delta: 'transition-opacity duration-150 ease-out motion-reduce:transition-none',
    body: 'min-w-0',
    loading: 'flex flex-col gap-4',
  },
  variants: {
    variant: {
      outline: '',
      elevated: '',
      soft: { root: '[--chart-surface:var(--canvas)]' },
      transparent: { root: '[--chart-surface:var(--canvas)]' },
    },
  },
});

export interface ChartCardProps extends Omit<
  ComponentProps<'div'>,
  'title' | 'children' | 'onError'
> {
  title: ReactNode;
  description?: ReactNode;
  headingLevel?: CardTitleLevel;
  value?: number;
  valueFormatOptions?: Intl.NumberFormatOptions;
  unit?: ReactNode;
  caption?: ReactNode;
  delta?: ChartCardDelta;
  periods?: readonly ChartCardPeriod[];
  period?: Key;
  defaultPeriod?: Key;
  onPeriodChange?: (period: Key) => void;
  readout?: ChartCardReadout;
  readoutValue?: (point: ChartPoint<unknown>) => number;
  actions?: ReactNode;
  showTableToggle?: boolean;
  view?: ChartView;
  defaultView?: ChartView;
  onViewChange?: (view: ChartView) => void;
  status?: ContentStatus;
  error?: unknown;
  onRetry?: () => void | Promise<unknown>;
  variant?: CardVariant;
  labels?: Partial<ChartCardLabels>;
  children: ReactNode;
}

function defaultReadoutValue(point: ChartPoint<unknown>) {
  if (point.isStacked) return point.total;
  return point.values.find((entry) => entry.value != null && !entry.isBelowBaseline)?.value ?? 0;
}

function deltaTone(value: number, polarity: ChartCardPolarity): TagTone {
  if (value === 0 || polarity === 'neutral') return 'neutral';
  const isGood = polarity === 'increase-is-good' ? value > 0 : value < 0;
  return isGood ? 'success' : 'error';
}

export function ChartCard({
  title,
  description,
  headingLevel = 3,
  value,
  valueFormatOptions,
  unit,
  caption,
  delta,
  periods,
  period: periodProp,
  defaultPeriod,
  onPeriodChange,
  readout = 'tooltip',
  readoutValue = defaultReadoutValue,
  actions,
  showTableToggle = false,
  view: viewProp,
  defaultView = 'chart',
  onViewChange,
  status = 'content',
  error,
  onRetry,
  variant = 'outline',
  labels,
  className,
  children,
  ...props
}: ChartCardProps) {
  const t = useLabels('chartCard', defaultChartCardLabels, labels);
  const icons = useIcons();
  const { locale } = useLocale();
  const { spatialEnabled } = useMotionPreference();
  const titleId = useId();
  const descriptionId = useId();
  const [period, setPeriod] = useControllableState<Key | undefined>(
    periodProp,
    defaultPeriod ?? periods?.[0]?.id,
    onPeriodChange as ((period: Key | undefined) => void) | undefined,
  );
  const [view, setView] = useControllableState<ChartView>(viewProp, defaultView, onViewChange);
  const [activePoint, setActivePoint] = useState<ChartPoint<unknown> | null>(null);
  const handleActivePoint = useCallback(
    (point: ChartPoint<unknown> | null) => setActivePoint(point),
    [],
  );
  const isReadout = readout === 'headline';

  const host = useMemo<ChartHostValue>(
    () => ({
      readout: isReadout,
      view,
      labelledBy: titleId,
      describedBy: description != null ? descriptionId : undefined,
      onActivePointChange: isReadout ? handleActivePoint : undefined,
    }),
    [isReadout, view, titleId, description, descriptionId, handleActivePoint],
  );

  const styles = chartCardStyles({ variant });
  const point = isReadout && view === 'chart' ? activePoint : null;
  const shownValue = point ? readoutValue(point) : value;
  const showHeadline = value !== undefined && status === 'content';
  const showCaption = caption != null || isReadout;

  const deltaNode = useMemo(() => {
    if (!delta) return null;
    const options = delta.formatOptions ?? { style: 'percent', maximumFractionDigits: 1 };
    const formatted = numberFormatter(locale, { ...options, signDisplay: 'never' }).format(
      delta.value,
    );
    const tone = deltaTone(delta.value, delta.polarity ?? 'increase-is-good');
    const spoken =
      delta.value === 0
        ? t.noChange
        : t.format(delta.value > 0 ? 'increase' : 'decrease', { value: formatted });
    const Icon = delta.value > 0 ? icons.arrowUpward : delta.value < 0 ? icons.arrowDownward : null;
    return (
      <Tag tone={tone} variant="soft" icon={Icon ? <Icon /> : undefined}>
        <span aria-hidden>{formatted}</span>
        <span className="sr-only">{spoken}</span>
      </Tag>
    );
  }, [delta, icons, locale, t]);

  const deltaDirection = !delta
    ? undefined
    : delta.value > 0
      ? 'up'
      : delta.value < 0
        ? 'down'
        : 'none';

  return (
    <Card
      {...props}
      variant={variant}
      data-slot="chart-card"
      data-readout={readout}
      data-view={view}
      className={styles.root({ className })}
    >
      <div data-slot="chart-card-header" className={styles.header()}>
        <div className={styles.heading()}>
          <CardTitle id={titleId} level={headingLevel}>
            {title}
          </CardTitle>
          {description != null ? (
            <CardDescription id={descriptionId}>{description}</CardDescription>
          ) : null}
        </div>
        {periods?.length || showTableToggle || actions != null ? (
          <div data-slot="chart-card-controls" className={styles.controls()}>
            {periods?.length ? (
              <SegmentedControl
                size="sm"
                aria-label={t.period}
                selectedKeys={period !== undefined ? [period] : []}
                onSelectionChange={(keys) => {
                  const [next] = keys;
                  if (next !== undefined) setPeriod(next);
                }}
              >
                {periods.map((entry) => (
                  <SegmentedControlItem key={String(entry.id)} id={entry.id}>
                    {entry.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            ) : null}
            {showTableToggle ? (
              <IconToggleButton
                size="sm"
                aria-label={t.showTable}
                icon={<icons.tableRows />}
                isSelected={view === 'table'}
                onChange={(isSelected) => setView(isSelected ? 'table' : 'chart')}
              />
            ) : null}
            {actions}
          </div>
        ) : null}
      </div>
      {showHeadline ? (
        <div data-slot="chart-card-headline" className={styles.headline()}>
          {showCaption ? (
            <p data-slot="chart-card-caption" className={styles.caption()}>
              {point ? point.label : (caption ?? t.total)}
            </p>
          ) : null}
          <div className={styles.figure()}>
            <span data-slot="chart-card-value" className={styles.value()}>
              <RollingNumber
                value={shownValue ?? 0}
                formatOptions={valueFormatOptions}
                isAnimated={spatialEnabled}
              />
            </span>
            {unit != null ? <span className={styles.unit()}>{unit}</span> : null}
            {deltaNode ? (
              <span
                data-slot="chart-card-delta"
                data-direction={deltaDirection}
                className={cn(styles.delta(), point && 'opacity-0')}
                aria-hidden={point ? true : undefined}
              >
                {deltaNode}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      <ContentState
        status={status}
        error={error}
        onRetry={onRetry}
        size="sm"
        headingLevel={Math.min(6, headingLevel + 1) as CardTitleLevel}
        loadingLabel={t.loading}
        emptyTitle={t.emptyTitle}
        loadingContent={
          <div className={styles.loading()}>
            {value !== undefined ? <Skeleton className="h-9 w-32 rounded-item" /> : null}
            <Skeleton className="h-52 w-full rounded-item" />
          </div>
        }
        className={styles.body()}
      >
        <ChartHostContext value={host}>{children}</ChartHostContext>
      </ContentState>
    </Card>
  );
}
