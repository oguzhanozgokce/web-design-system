'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import { FunnelChart } from '@/registry/ds/ui/funnel-chart';

const periods = [
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
];
const values = { month: [12400, 8680, 4340, 1302], quarter: [38600, 27020, 16212, 4864] };
const names = ['App installs', 'Signed in', 'First action', 'Upgraded'];

export default function FunnelChartDemo() {
  const [period, setPeriod] = useState<Key>('month');
  const counts = values[period as keyof typeof values];
  return (
    <ChartCard
      title="Activation funnel"
      description="People who installed in the selected period, followed through the same steps."
      value={counts.at(-1)}
      caption="Upgraded"
      periods={periods}
      period={period}
      onPeriodChange={setPeriod}
      showTableToggle
      className="w-full max-w-3xl"
    >
      <FunnelChart
        stages={names.map((label, index) => ({ id: label, label, value: counts[index] }))}
      />
    </ChartCard>
  );
}
