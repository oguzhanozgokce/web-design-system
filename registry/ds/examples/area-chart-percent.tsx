import { AreaChart } from '@/registry/ds/ui/area-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Month {
  month: string;
  phone: number;
  tablet: number;
  desktop: number;
}

const data: Month[] = [
  { month: 'Jan', phone: 5200, tablet: 1100, desktop: 3900 },
  { month: 'Feb', phone: 5600, tablet: 1080, desktop: 3820 },
  { month: 'Mar', phone: 6100, tablet: 1050, desktop: 3700 },
  { month: 'Apr', phone: 6400, tablet: 1010, desktop: 3640 },
  { month: 'May', phone: 6900, tablet: 980, desktop: 3600 },
  { month: 'Jun', phone: 7600, tablet: 1020, desktop: 3300 },
];

const series: ChartSeries<Month>[] = [
  { id: 'phone', label: 'Phone', value: 'phone' },
  { id: 'tablet', label: 'Tablet', value: 'tablet' },
  { id: 'desktop', label: 'Desktop', value: 'desktop' },
];

export default function AreaChartPercent() {
  return (
    <div className="w-full max-w-xl">
      <AreaChart
        aria-label="Share of visits by device"
        data={data}
        category="month"
        series={series}
        layout="percent"
        curve="linear"
      />
    </div>
  );
}
