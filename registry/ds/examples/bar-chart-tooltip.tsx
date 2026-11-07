import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartTooltip, type ChartSeries } from '@/registry/ds/ui/chart';

interface Day {
  day: string;
  builds: number;
  failed: number;
}

const data: Day[] = [
  { day: 'Mon', builds: 32, failed: 2 },
  { day: 'Tue', builds: 41, failed: 1 },
  { day: 'Wed', builds: 38, failed: 4 },
  { day: 'Thu', builds: 45, failed: 0 },
  { day: 'Fri', builds: 51, failed: 3 },
];

const series: ChartSeries<Day>[] = [
  { id: 'builds', label: 'Builds', value: 'builds' },
  { id: 'failed', label: 'Failed', value: 'failed', isBelowBaseline: true },
];

const percent = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 });

export default function BarChartTooltip() {
  return (
    <div className="w-full max-w-md">
      <BarChart
        aria-label="Builds per day"
        data={data}
        category="day"
        series={series}
        tooltip={(point) => (
          <ChartTooltip
            title={point.label}
            total={`${percent.format(1 - point.datum.failed / point.datum.builds)} passed`}
            items={point.values.map((entry) => ({
              id: entry.id,
              label: entry.label,
              value: entry.formatted,
              color: entry.color,
            }))}
          />
        )}
      />
    </div>
  );
}
