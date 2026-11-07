import type { ChartSeries } from '@/registry/ds/ui/chart';
import { LineChart } from '@/registry/ds/ui/line-chart';

interface Month {
  month: Date;
  thisYear: number;
  lastYear: number;
}

const visits = [
  [9840, 8210],
  [10120, 8460],
  [11380, 9950],
  [10960, 10240],
  [12210, 10880],
  [12740, 11020],
  [13980, 11760],
  [13120, 12030],
  [14210, 12190],
  [14690, 12480],
  [14360, 12160],
  [15120, 11920],
];

const data: Month[] = visits.map(([thisYear, lastYear], index) => ({
  month: new Date(2026, index, 1),
  thisYear,
  lastYear,
}));

const series: ChartSeries<Month>[] = [
  { id: 'this-year', label: 'This year', value: 'thisYear', color: 'primary' },
  { id: 'last-year', label: 'Last year', value: 'lastYear', color: 'neutral', lineStyle: 'dashed' },
];

export default function LineChartDemo() {
  return (
    <div className="w-full max-w-xl">
      <LineChart
        aria-label="Visits per month, this year against last year"
        data={data}
        category="month"
        series={series}
        formatCategory={(value, context) =>
          value instanceof Date
            ? value.toLocaleDateString(
                'en',
                context === 'axis' ? { month: 'short' } : { month: 'long', year: 'numeric' },
              )
            : String(value)
        }
      />
    </div>
  );
}
