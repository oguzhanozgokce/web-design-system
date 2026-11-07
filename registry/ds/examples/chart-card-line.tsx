import type { ChartSeries } from '@/registry/ds/ui/chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import { LineChart } from '@/registry/ds/ui/line-chart';

interface Month {
  month: Date;
  thisYear: number;
  lastYear: number;
}

const values = [
  [9840, 8210],
  [10120, 8460],
  [11380, 9950],
  [10960, 10240],
  [12210, 10880],
  [12740, 11020],
  [13980, 11760],
  [13120, 12030],
  [14210, 12190],
];

const data: Month[] = values.map(([thisYear, lastYear], index) => ({
  month: new Date(2026, index, 1),
  thisYear,
  lastYear,
}));

const series: ChartSeries<Month>[] = [
  { id: 'this-year', label: 'This year', value: 'thisYear', color: 'primary' },
  { id: 'last-year', label: 'Last year', value: 'lastYear', color: 'neutral', lineStyle: 'dashed' },
];

const total = data.reduce((sum, row) => sum + row.thisYear, 0);
const previous = data.reduce((sum, row) => sum + row.lastYear, 0);

export default function ChartCardLine() {
  return (
    <ChartCard
      className="w-full max-w-xl"
      title="Active users"
      caption="January to September"
      value={total}
      delta={{ value: (total - previous) / previous }}
      readout="headline"
    >
      <AreaOrLine />
    </ChartCard>
  );
}

function AreaOrLine() {
  return (
    <LineChart
      data={data}
      category="month"
      series={series}
      legend="top"
      formatCategory={(value, context) =>
        value instanceof Date
          ? value.toLocaleDateString(
              'en',
              context === 'axis' ? { month: 'short' } : { month: 'long' },
            )
          : String(value)
      }
    />
  );
}
