import { BarChart } from '@/registry/ds/ui/bar-chart';

const data = [
  { hour: '08', visits: 12 },
  { hour: '10', visits: 28 },
  { hour: '12', visits: 41 },
  { hour: '14', visits: 36 },
  { hour: '16', visits: 44 },
  { hour: '18', visits: 30 },
  { hour: '20', visits: 22 },
  { hour: '22', visits: 9 },
];

const series = [{ id: 'visits', label: 'Visits', value: 'visits' as const }];

export default function BarChartSizes() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <div className="flex items-center gap-4">
        <span className="text-sm text-on-surface-variant">Today</span>
        <BarChart
          aria-label="Visits today, every two hours"
          data={data}
          category="hour"
          series={series}
          size="sm"
          height={32}
          barGap={3}
          className="w-28"
        />
      </div>
      <BarChart
        aria-label="Visits today, every two hours"
        data={data}
        category="hour"
        series={series}
      />
      <BarChart
        aria-label="Visits today, every two hours"
        data={data}
        category="hour"
        series={series}
        size="lg"
      />
    </div>
  );
}
