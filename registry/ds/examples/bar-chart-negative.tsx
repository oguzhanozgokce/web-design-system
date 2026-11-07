import { BarChart } from '@/registry/ds/ui/bar-chart';

const data = [
  { week: 'W1', change: 14 },
  { week: 'W2', change: 9 },
  { week: 'W3', change: -6 },
  { week: 'W4', change: 18 },
  { week: 'W5', change: -11 },
  { week: 'W6', change: 4 },
  { week: 'W7', change: 22 },
  { week: 'W8', change: -3 },
];

export default function BarChartNegative() {
  return (
    <div className="w-full max-w-xl">
      <BarChart
        aria-label="Change in active projects per week"
        data={data}
        category="week"
        series={[{ id: 'change', label: 'Change', value: 'change' }]}
        valueFormatOptions={{ signDisplay: 'exceptZero' }}
      />
    </div>
  );
}
