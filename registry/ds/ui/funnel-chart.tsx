'use client';

import { useMemo, type ComponentProps } from 'react';
import { motion } from 'motion/react';
import { useLocale } from 'react-aria-components';
import { funnelMetrics, funnelPath } from '@/registry/ds/lib/funnel-chart.ts';
import { fluidTween } from '@/registry/ds/lib/motion';
import { tv } from '@/registry/ds/lib/utils';
import {
  chartColorClasses,
  chartDataTableStyles,
  chartMonoRoleClasses,
  useChartHost,
  type ChartColor,
  type ChartMonoRole,
  type ChartPalette,
  type ChartView,
} from '@/registry/ds/ui/chart';
import { useLabels, useMotionPreference } from '@/registry/ds/ui/ds-provider';

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color?: ChartColor;
}

export interface FunnelChartLabels {
  title: string;
  flow: string;
  stage: string;
  count: string;
  previous: string;
  first: string;
  overall: string;
  unavailable: string;
  empty: string;
}

export const defaultFunnelChartLabels: FunnelChartLabels = {
  title: 'Conversion funnel',
  flow: 'Stage flow',
  stage: 'Stage',
  count: 'Count',
  previous: 'Of previous step',
  first: 'Of first step',
  overall: 'Overall conversion',
  unavailable: '—',
  empty: 'No stages to display',
};

export const funnelChartStyles = tv({
  slots: {
    root: 'min-w-0 text-on-surface',
    summary:
      'mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-on-surface-variant',
    rate: 'text-lg font-semibold text-on-surface tabular-nums',
    scroller: 'focus-ring-inset overflow-x-auto rounded-item pb-2',
    flow: 'w-full overflow-visible rtl:-scale-x-100',
    path: 'fill-(--chart-color) stroke-(--chart-surface,var(--surface-raised)) stroke-[3px] [vector-effect:non-scaling-stroke]',
    stages: 'mt-4 grid gap-3',
    stage: 'min-w-0 border-s border-outline-subtle ps-3 text-start',
    name: 'text-xs font-medium text-on-surface-variant [overflow-wrap:anywhere]',
    count: 'mt-1 text-xl font-semibold text-on-surface tabular-nums',
    conversion: 'mt-3 flex flex-col gap-0.5 text-xs text-on-surface-variant',
    conversionValue: 'font-medium text-on-surface tabular-nums',
    empty: 'py-12 text-center text-sm text-on-surface-variant',
  },
});

export interface FunnelChartProps extends Omit<ComponentProps<'div'>, 'children'> {
  stages: readonly FunnelStage[];
  palette?: ChartPalette;
  monoColor?: ChartMonoRole;
  view?: ChartView;
  labels?: Partial<FunnelChartLabels>;
  valueFormatOptions?: Intl.NumberFormatOptions;
}

export function FunnelChart({
  stages,
  palette = 'mono',
  monoColor = 'primary',
  view: viewProp,
  labels,
  valueFormatOptions,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  ...props
}: FunnelChartProps) {
  const t = useLabels('funnelChart', defaultFunnelChartLabels, labels);
  const host = useChartHost();
  const { locale } = useLocale();
  const { spatialEnabled, effectsEnabled } = useMotionPreference();
  const metrics = useMemo(() => funnelMetrics(stages.map((stage) => stage.value)), [stages]);
  const number = useMemo(
    () => new Intl.NumberFormat(locale, valueFormatOptions),
    [locale, valueFormatOptions],
  );
  const percent = useMemo(
    () => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }),
    [locale],
  );
  const styles = funnelChartStyles();
  const tableStyles = chartDataTableStyles();
  const view = viewProp ?? host?.view ?? 'chart';
  const labelledBy = ariaLabelledby ?? (ariaLabel ? undefined : host?.labelledBy);
  const name = ariaLabel ?? (labelledBy ? undefined : t.title);
  const formatCount = (value: number | null) =>
    value === null ? t.unavailable : number.format(value);
  const formatRate = (value: number | null) =>
    value === null ? t.unavailable : percent.format(value);

  return (
    <div
      {...props}
      data-slot="funnel-chart"
      data-palette={palette}
      data-view={view}
      className={styles.root({ className })}
      aria-describedby={ariaDescribedby ?? host?.describedBy}
    >
      {stages.length === 0 ? (
        <p className={styles.empty()}>{t.empty}</p>
      ) : (
        <>
          {view === 'chart' ? (
            <div>
              <div className={styles.summary()}>
                <span>{t.overall}</span>
                <strong className={styles.rate()}>{formatRate(metrics.at(-1)!.firstRate)}</strong>
              </div>
            </div>
          ) : null}
          {view === 'chart' ? (
            <div role="region" aria-label={t.flow} tabIndex={0} className={styles.scroller()}>
              <div style={{ minWidth: stages.length * 104 }} aria-hidden="true">
                <motion.svg
                  data-slot="funnel-flow"
                  viewBox={`0 0 ${stages.length * 200} 200`}
                  className={styles.flow()}
                  preserveAspectRatio="none"
                  style={{ height: 176 }}
                  initial={
                    effectsEnabled
                      ? { opacity: 0, ...(spatialEnabled ? { scaleY: 0.9 } : {}) }
                      : false
                  }
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={fluidTween(effectsEnabled ? 300 : 0)}
                >
                  {stages.map((stage, index) => (
                    <path
                      key={stage.id}
                      d={funnelPath(
                        metrics[index].height,
                        metrics[index + 1]?.height ?? metrics[index].height,
                      )}
                      transform={`translate(${index * 200} 0)`}
                      className={styles.path({
                        className: [
                          chartMonoRoleClasses[monoColor],
                          chartColorClasses[
                            stage.color ??
                              (palette === 'mono'
                                ? (`mono-${Math.min(index + 1, 4)}` as ChartColor)
                                : (`chart-${(index % 8) + 1}` as ChartColor))
                          ],
                        ],
                      })}
                    />
                  ))}
                </motion.svg>
                <ol
                  className={styles.stages()}
                  style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
                >
                  {stages.map((stage, index) => (
                    <li key={stage.id} className={styles.stage()}>
                      <p className={styles.name()}>{stage.label}</p>
                      <p className={styles.count()}>{formatCount(metrics[index].value)}</p>
                      <p className={styles.conversion()}>
                        <span className={styles.conversionValue()}>
                          {formatRate(metrics[index].previousRate)}
                        </span>
                        <span>{t.previous}</span>
                      </p>
                      <p className={styles.conversion()}>
                        <span className={styles.conversionValue()}>
                          {formatRate(metrics[index].firstRate)}
                        </span>
                        <span>{t.first}</span>
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}
          <div
            className={view === 'table' ? tableStyles.scroller() : 'sr-only'}
            role={view === 'table' ? 'region' : undefined}
            tabIndex={view === 'table' ? 0 : undefined}
            aria-label={view === 'table' ? name : undefined}
            aria-labelledby={view === 'table' ? labelledBy : undefined}
          >
            <table className={tableStyles.table()} aria-label={name} aria-labelledby={labelledBy}>
              <thead>
                <tr>
                  {[t.stage, t.count, t.previous, t.first].map((heading, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={tableStyles.headCell({
                        className: index === 0 ? 'text-start' : 'text-end',
                      })}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stages.map((stage, index) => (
                  <tr key={stage.id} className={tableStyles.row()}>
                    <th scope="row" className={tableStyles.rowHead()}>
                      {stage.label}
                    </th>
                    <td className={tableStyles.cell()}>{formatCount(metrics[index].value)}</td>
                    <td className={tableStyles.cell()}>
                      {formatRate(metrics[index].previousRate)}
                    </td>
                    <td className={tableStyles.cell()}>{formatRate(metrics[index].firstRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
