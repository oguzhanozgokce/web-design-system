'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';

interface Bucket {
  date: Date;
  direct: number;
  search: number;
  social: number;
  bounced: number;
}

function series(seed: number, count: number, step: number, scale: number): Bucket[] {
  return Array.from({ length: count }, (_, index) => {
    const wave = 1 + 0.35 * Math.sin((index + seed) * 0.9) + 0.15 * Math.cos(index * 2.3);
    return {
      date: new Date(2026, 9, 1 + index * step),
      direct: Math.round(520 * scale * wave),
      search: Math.round(360 * scale * (wave * 0.9 + 0.1)),
      social: Math.round(210 * scale * (1.2 - wave * 0.3)),
      bounced: Math.round(8 * scale * (1.4 - wave * 0.4)),
    };
  });
}

const datasets: Record<string, Bucket[]> = {
  day: series(1, 20, 1, 1),
  week: series(4, 12, 7, 6),
};

const bars: ChartSeries<Bucket>[] = [
  { id: 'direct', label: 'Direct', value: 'direct' },
  { id: 'search', label: 'Search', value: 'search' },
  { id: 'social', label: 'Social', value: 'social' },
  { id: 'bounced', label: 'Bounced', value: 'bounced', isBelowBaseline: true },
];

export default function ChartCardTooltip() {
  const [period, setPeriod] = useState<Key>('day');
  const data = datasets[String(period)];
  const total = data.reduce((sum, row) => sum + row.direct + row.search + row.social, 0);

  return (
    <ChartCard
      className="w-full max-w-md"
      title="Traffic"
      description={period === 'day' ? 'Last 20 days' : 'Last 12 weeks'}
      value={total}
      unit="visits"
      periods={[
        { id: 'day', label: 'Day' },
        { id: 'week', label: 'Week' },
      ]}
      period={period}
      onPeriodChange={setPeriod}
    >
      <BarChart
        data={data}
        category="date"
        series={bars}
        layout="stacked"
        valueAxis={{ isVisible: false }}
        categoryAxis={{ ticks: 'ends' }}
        showGrid={false}
        legend="none"
      />
    </ChartCard>
  );
}
