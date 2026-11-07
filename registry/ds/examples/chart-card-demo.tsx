'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';

interface Bucket {
  label: string;
  downloads: number;
}

const periods = {
  week: [
    { label: 'Mon', downloads: 1240 },
    { label: 'Tue', downloads: 1612 },
    { label: 'Wed', downloads: 1498 },
    { label: 'Thu', downloads: 1877 },
    { label: 'Fri', downloads: 2104 },
    { label: 'Sat', downloads: 1320 },
    { label: 'Sun', downloads: 1186 },
  ],
  month: [
    { label: 'Jan', downloads: 31200 },
    { label: 'Feb', downloads: 28640 },
    { label: 'Mar', downloads: 35110 },
    { label: 'Apr', downloads: 33980 },
    { label: 'May', downloads: 38420 },
    { label: 'Jun', downloads: 41250 },
    { label: 'Jul', downloads: 39870 },
    { label: 'Aug', downloads: 36410 },
    { label: 'Sep', downloads: 42980 },
    { label: 'Oct', downloads: 45120 },
    { label: 'Nov', downloads: 43760 },
    { label: 'Dec', downloads: 48210 },
  ],
  year: [
    { label: '2022', downloads: 286000 },
    { label: '2023', downloads: 341500 },
    { label: '2024', downloads: 402300 },
    { label: '2025', downloads: 455900 },
    { label: '2026', downloads: 464850 },
  ],
} satisfies Record<string, Bucket[]>;

const deltas = { week: 0.124, month: 0.087, year: 0.019 };

export default function ChartCardDemo() {
  const [period, setPeriod] = useState<Key>('month');
  const key = period as keyof typeof periods;
  const data = periods[key];
  const total = data.reduce((sum, bucket) => sum + bucket.downloads, 0);

  return (
    <ChartCard
      className="w-full max-w-xl"
      title="Downloads"
      description="Across every platform"
      value={total}
      delta={{ value: deltas[key] }}
      periods={[
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: 'year', label: 'Year' },
      ]}
      period={period}
      onPeriodChange={setPeriod}
      readout="headline"
    >
      <BarChart
        data={data}
        category="label"
        series={[{ id: 'downloads', label: 'Downloads', value: 'downloads' }]}
        showTrack
        radius="full"
        maxBarSize={28}
        valueAxis={{ isVisible: false }}
      />
    </ChartCard>
  );
}
