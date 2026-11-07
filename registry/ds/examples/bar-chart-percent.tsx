import { BarChart } from '@/registry/ds/ui/bar-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Quarter {
  quarter: string;
  phone: number;
  tablet: number;
  desktop: number;
}

const data: Quarter[] = [
  { quarter: 'Q1', phone: 5200, tablet: 1100, desktop: 3900 },
  { quarter: 'Q2', phone: 6100, tablet: 1050, desktop: 3700 },
  { quarter: 'Q3', phone: 6900, tablet: 980, desktop: 3600 },
  { quarter: 'Q4', phone: 7600, tablet: 1020, desktop: 3300 },
];

const series: ChartSeries<Quarter>[] = [
  { id: 'phone', label: 'Phone', value: 'phone' },
  { id: 'tablet', label: 'Tablet', value: 'tablet' },
  { id: 'desktop', label: 'Desktop', value: 'desktop' },
];

export default function BarChartPercent() {
  return (
    <div className="w-full max-w-md">
      <BarChart
        aria-label="Visits by device, share of each quarter"
        data={data}
        category="quarter"
        series={series}
        layout="percent"
        maxBarSize={40}
      />
    </div>
  );
}
