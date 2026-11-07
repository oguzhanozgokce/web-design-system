import { BarChart } from '@/registry/ds/ui/bar-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Day {
  day: string;
  direct: number;
  search: number;
  social: number;
  bounced: number;
}

const data: Day[] = [
  { day: 'Mon', direct: 412, search: 298, social: 140, bounced: 6 },
  { day: 'Tue', direct: 538, search: 344, social: 205, bounced: 9 },
  { day: 'Wed', direct: 601, search: 377, social: 188, bounced: 7 },
  { day: 'Thu', direct: 574, search: 402, social: 236, bounced: 11 },
  { day: 'Fri', direct: 489, search: 331, social: 172, bounced: 5 },
  { day: 'Sat', direct: 262, search: 171, social: 98, bounced: 3 },
  { day: 'Sun', direct: 240, search: 160, social: 104, bounced: 4 },
];

const series: ChartSeries<Day>[] = [
  { id: 'direct', label: 'Direct', value: 'direct' },
  { id: 'search', label: 'Search', value: 'search' },
  { id: 'social', label: 'Social', value: 'social' },
  { id: 'bounced', label: 'Bounced', value: 'bounced', isBelowBaseline: true },
];

export default function ChartMono() {
  return (
    <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-2">
      <BarChart
        aria-label="Visits by source, in the accent colour"
        data={data}
        category="day"
        series={series}
        layout="stacked"
        palette="mono"
        valueAxis={{ isVisible: false }}
        showGrid={false}
      />
      <BarChart
        aria-label="Visits by source, in the text colour"
        data={data}
        category="day"
        series={series}
        layout="stacked"
        palette="mono"
        monoColor="neutral"
        valueAxis={{ isVisible: false }}
        showGrid={false}
      />
    </div>
  );
}
