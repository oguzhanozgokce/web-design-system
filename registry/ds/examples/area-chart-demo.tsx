import { AreaChart } from '@/registry/ds/ui/area-chart';

const data = [
  { day: 'Mon', uploads: 182 },
  { day: 'Tue', uploads: 236 },
  { day: 'Wed', uploads: 214 },
  { day: 'Thu', uploads: 298 },
  { day: 'Fri', uploads: 341 },
  { day: 'Sat', uploads: 276 },
  { day: 'Sun', uploads: 312 },
];

export default function AreaChartDemo() {
  return (
    <div className="w-full max-w-xl">
      <AreaChart
        aria-label="Photo uploads this week"
        data={data}
        category="day"
        series={[{ id: 'uploads', label: 'Uploads', value: 'uploads' }]}
      />
    </div>
  );
}
