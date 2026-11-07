'use client';

import {
  LineChartBase,
  type AreaChartFill,
  type AreaChartLayout,
  type LineChartProps,
} from '@/registry/ds/ui/line-chart';

export type { AreaChartFill, AreaChartLayout };

export interface AreaChartProps<T> extends LineChartProps<T> {
  layout?: AreaChartLayout;
  fill?: AreaChartFill;
}

export function AreaChart<T>({ layout = 'overlap', fill, ...props }: AreaChartProps<T>) {
  return (
    <LineChartBase
      {...props}
      kind="area"
      layout={layout}
      fill={fill ?? (layout === 'overlap' ? 'gradient' : 'solid')}
    />
  );
}
