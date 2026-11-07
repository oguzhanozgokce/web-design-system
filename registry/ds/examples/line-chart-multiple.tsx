import type { ChartSeries } from '@/registry/ds/ui/chart';
import { LineChart } from '@/registry/ds/ui/line-chart';

interface Week {
  week: string;
  phone: number;
  desktop: number;
  tablet: number;
  tv: number;
}

const data: Week[] = [
  { week: 'W1', phone: 420, desktop: 310, tablet: 96, tv: 41 },
  { week: 'W2', phone: 446, desktop: 302, tablet: 101, tv: 44 },
  { week: 'W3', phone: 471, desktop: 318, tablet: 92, tv: 52 },
  { week: 'W4', phone: 498, desktop: 296, tablet: 105, tv: 58 },
  { week: 'W5', phone: 530, desktop: 305, tablet: 110, tv: 61 },
  { week: 'W6', phone: 552, desktop: 289, tablet: 104, tv: 70 },
  { week: 'W7', phone: 589, desktop: 293, tablet: 112, tv: 76 },
  { week: 'W8', phone: 610, desktop: 284, tablet: 118, tv: 83 },
];

const series: ChartSeries<Week>[] = [
  { id: 'phone', label: 'Phone', value: 'phone' },
  { id: 'desktop', label: 'Desktop', value: 'desktop' },
  { id: 'tablet', label: 'Tablet', value: 'tablet' },
  { id: 'tv', label: 'TV', value: 'tv' },
];

export default function LineChartMultiple() {
  return (
    <div className="w-full max-w-xl">
      <LineChart
        aria-label="Weekly active devices by type"
        data={data}
        category="week"
        series={series}
        legend="top"
      />
    </div>
  );
}
