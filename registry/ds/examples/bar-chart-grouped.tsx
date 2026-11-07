import { BarChart } from '@/registry/ds/ui/bar-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Month {
  month: string;
  thisYear: number;
  lastYear: number;
}

const data: Month[] = [
  { month: 'Jan', thisYear: 1680, lastYear: 1510 },
  { month: 'Feb', thisYear: 1740, lastYear: 1480 },
  { month: 'Mar', thisYear: 1920, lastYear: 1650 },
  { month: 'Apr', thisYear: 1850, lastYear: 1620 },
  { month: 'May', thisYear: 2040, lastYear: 1710 },
  { month: 'Jun', thisYear: 2110, lastYear: 1760 },
];

const series: ChartSeries<Month>[] = [
  { id: 'this-year', label: 'This year', value: 'thisYear', color: 'primary' },
  { id: 'last-year', label: 'Last year', value: 'lastYear', color: 'neutral' },
];

export default function BarChartGrouped() {
  return (
    <div className="w-full max-w-xl">
      <BarChart
        aria-label="New projects per month, this year and last year"
        data={data}
        category="month"
        series={series}
      />
    </div>
  );
}
