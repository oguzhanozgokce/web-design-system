import { BarChart } from '@/registry/ds/ui/bar-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Day {
  date: Date;
  direct: number;
  search: number;
  social: number;
  email: number;
  bounced: number;
}

const visits: [number, number, number, number, number][] = [
  [412, 298, 140, 188, 6],
  [538, 344, 205, 240, 9],
  [601, 377, 188, 264, 7],
  [574, 402, 236, 301, 11],
  [489, 331, 172, 222, 5],
  [262, 171, 98, 120, 3],
  [240, 160, 104, 132, 4],
  [622, 418, 230, 410, 12],
  [655, 391, 251, 288, 8],
  [590, 366, 214, 270, 7],
  [702, 455, 286, 520, 14],
  [548, 349, 190, 247, 6],
  [281, 186, 112, 141, 3],
  [255, 172, 96, 118, 4],
  [610, 402, 222, 280, 9],
  [671, 436, 261, 305, 10],
  [633, 410, 240, 296, 8],
  [720, 471, 302, 344, 13],
  [598, 388, 207, 262, 7],
  [301, 194, 121, 150, 5],
];

const data: Day[] = visits.map(([direct, search, social, email, bounced], index) => ({
  date: new Date(2026, 9, 1 + index),
  direct,
  search,
  social,
  email,
  bounced,
}));

const series: ChartSeries<Day>[] = [
  { id: 'direct', label: 'Direct', value: 'direct' },
  { id: 'search', label: 'Search', value: 'search' },
  { id: 'social', label: 'Social', value: 'social' },
  { id: 'email', label: 'Email', value: 'email' },
  { id: 'bounced', label: 'Bounced', value: 'bounced', isBelowBaseline: true },
];

export default function BarChartDemo() {
  return (
    <div className="w-full max-w-md">
      <BarChart
        aria-label="Visits by source, last 20 days"
        data={data}
        category="date"
        series={series}
        layout="stacked"
        valueAxis={{ isVisible: false }}
        categoryAxis={{ ticks: 'ends' }}
        showGrid={false}
      />
    </div>
  );
}
