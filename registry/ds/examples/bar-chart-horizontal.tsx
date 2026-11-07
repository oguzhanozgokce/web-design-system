import { BarChart } from '@/registry/ds/ui/bar-chart';

const data = [
  { folder: 'Photos', size: 48.2 },
  { folder: 'Videos', size: 36.9 },
  { folder: 'Backups', size: 21.4 },
  { folder: 'Music', size: 12.7 },
  { folder: 'Documents', size: 6.3 },
  { folder: 'Downloads', size: 3.1 },
];

export default function BarChartHorizontal() {
  return (
    <div className="w-full max-w-xl">
      <BarChart
        aria-label="Storage by folder"
        data={data}
        category="folder"
        series={[{ id: 'size', label: 'Size', value: 'size' }]}
        orientation="horizontal"
        radius="full"
        valueFormatOptions={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
      />
    </div>
  );
}
