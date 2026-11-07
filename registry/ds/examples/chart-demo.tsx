import { BarChart } from '@/registry/ds/ui/bar-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

type Kind = 'photos' | 'videos' | 'music' | 'documents' | 'archives' | 'apps' | 'backups' | 'other';

type Month = { month: string } & Record<Kind, number>;

const kinds: [Kind, string][] = [
  ['photos', 'Photos'],
  ['videos', 'Videos'],
  ['music', 'Music'],
  ['documents', 'Documents'],
  ['archives', 'Archives'],
  ['apps', 'Apps'],
  ['backups', 'Backups'],
  ['other', 'Other'],
];

const rows = [
  [18, 14, 6, 4, 3, 5, 9, 2],
  [19, 15, 6, 4, 3, 5, 9, 2],
  [21, 15, 7, 5, 3, 6, 10, 2],
  [22, 17, 7, 5, 4, 6, 10, 3],
  [24, 18, 7, 5, 4, 6, 11, 3],
  [25, 20, 8, 6, 4, 7, 11, 3],
];

const data: Month[] = rows.map((values, index) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
  ...(Object.fromEntries(kinds.map(([kind], position) => [kind, values[position]])) as Record<
    Kind,
    number
  >),
}));

const series: ChartSeries<Month>[] = kinds.map(([kind, label]) => ({
  id: kind,
  label,
  value: kind,
}));

export default function ChartDemo() {
  return (
    <div className="w-full max-w-xl">
      <BarChart
        aria-label="Storage used by file type"
        data={data}
        category="month"
        series={series}
        layout="stacked"
        maxBarSize={36}
        valueFormatOptions={{ style: 'unit', unit: 'gigabyte' }}
      />
    </div>
  );
}
