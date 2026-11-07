import { BarChart } from '@/registry/ds/ui/bar-chart';

const data = [
  { day: 'Mon', sessions: 320 },
  { day: 'Tue', sessions: 412 },
  { day: 'Wed', sessions: 386 },
  { day: 'Thu', sessions: 451 },
  { day: 'Fri', sessions: 498 },
  { day: 'Sat', sessions: 214 },
  { day: 'Sun', sessions: 188 },
];

export default function BarChartTrack() {
  return (
    <div className="w-full max-w-md">
      <BarChart
        aria-label="Sessions per day this week"
        data={data}
        category="day"
        series={[{ id: 'sessions', label: 'Sessions', value: 'sessions' }]}
        showTrack
        radius="full"
        maxBarSize={32}
        valueAxis={{ isVisible: false }}
      />
    </div>
  );
}
