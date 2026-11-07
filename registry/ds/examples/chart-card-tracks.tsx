'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';

interface Bucket {
  label: string;
  hours: number;
}

function buckets(labels: string[], hours: number[]): Bucket[] {
  return labels.map((label, index) => ({ label, hours: hours[index] }));
}

const periods: Record<string, { buckets: Bucket[]; delta: number; caption: string }> = {
  weekly: {
    buckets: buckets(
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      [5.5, 6.25, 4.75, 7, 6.5, 2.25, 1.5],
    ),
    delta: 0.062,
    caption: 'This week',
  },
  monthly: {
    buckets: buckets(
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [96, 104, 121, 112, 118, 97, 74, 69, 126, 131, 124, 88],
    ),
    delta: 0.041,
    caption: 'This year',
  },
  yearly: {
    buckets: buckets(['2022', '2023', '2024', '2025', '2026'], [980, 1104, 1186, 1242, 1260]),
    delta: -0.018,
    caption: 'Since 2022',
  },
};

export default function ChartCardTracks() {
  const [period, setPeriod] = useState<Key>('monthly');
  const { buckets: data, delta, caption } = periods[String(period)];
  const total = data.reduce((sum, bucket) => sum + bucket.hours, 0);

  return (
    <ChartCard
      className="w-full max-w-sm"
      variant="elevated"
      title="Focus time"
      caption={caption}
      value={total}
      valueFormatOptions={{ maximumFractionDigits: 1 }}
      unit="h"
      delta={{ value: delta }}
      periods={[
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' },
      ]}
      period={period}
      onPeriodChange={setPeriod}
      readout="headline"
    >
      <BarChart
        data={data}
        category="label"
        series={[
          {
            id: 'hours',
            label: 'Focus time',
            value: 'hours',
            formatOptions: { style: 'unit', unit: 'hour', maximumFractionDigits: 1 },
          },
        ]}
        showTrack
        radius="full"
        maxBarSize={16}
        barGap={4}
        height={144}
        valueAxis={{ isVisible: false }}
        categoryAxis={{ ticks: 'ends' }}
      />
    </ChartCard>
  );
}
