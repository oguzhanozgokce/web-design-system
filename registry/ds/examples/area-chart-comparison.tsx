import { AreaChart } from '@/registry/ds/ui/area-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Day {
  date: Date;
  thisWeek: number;
  lastWeek: number;
}

const values = [
  [182, 160],
  [236, 171],
  [214, 198],
  [298, 205],
  [341, 254],
  [276, 238],
  [312, 226],
];

const data: Day[] = values.map(([thisWeek, lastWeek], index) => ({
  date: new Date(2026, 10, 2 + index),
  thisWeek,
  lastWeek,
}));

const series: ChartSeries<Day>[] = [
  { id: 'this-week', label: 'This week', value: 'thisWeek', color: 'primary' },
  { id: 'last-week', label: 'Last week', value: 'lastWeek', color: 'neutral', lineStyle: 'dashed' },
];

export default function AreaChartComparison() {
  return (
    <div className="w-full max-w-xl">
      <AreaChart
        aria-label="Photo uploads, this week against last week"
        data={data}
        category="date"
        series={series}
      />
    </div>
  );
}
