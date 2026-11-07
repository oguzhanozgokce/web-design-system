import { LineChart } from '@/registry/ds/ui/line-chart';

const data = [
  { hour: '00:00', temperature: 18.2 },
  { hour: '03:00', temperature: 17.1 },
  { hour: '06:00', temperature: 16.4 },
  { hour: '09:00', temperature: null },
  { hour: '12:00', temperature: null },
  { hour: '15:00', temperature: 24.8 },
  { hour: '18:00', temperature: 23.1 },
  { hour: '21:00', temperature: 20.5 },
];

export default function LineChartGaps() {
  return (
    <div className="w-full max-w-xl">
      <LineChart
        aria-label="Room temperature today"
        description="The sensor was offline between 09:00 and 12:00."
        data={data}
        category="hour"
        series={[{ id: 'temperature', label: 'Temperature', value: 'temperature' }]}
        valueAxis={{ domain: [10, 'auto'] }}
        valueFormatOptions={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }}
        dots="all"
      />
    </div>
  );
}
