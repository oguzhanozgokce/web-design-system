import { AreaChart } from '@/registry/ds/ui/area-chart';
import type { ChartSeries } from '@/registry/ds/ui/chart';

interface Month {
  month: string;
  photos: number;
  videos: number;
  documents: number;
}

const data: Month[] = [
  { month: 'Jan', photos: 42, videos: 28, documents: 9 },
  { month: 'Feb', photos: 46, videos: 31, documents: 10 },
  { month: 'Mar', photos: 51, videos: 30, documents: 12 },
  { month: 'Apr', photos: 55, videos: 36, documents: 12 },
  { month: 'May', photos: 61, videos: 39, documents: 14 },
  { month: 'Jun', photos: 64, videos: 45, documents: 15 },
  { month: 'Jul', photos: 70, videos: 47, documents: 15 },
  { month: 'Aug', photos: 73, videos: 52, documents: 17 },
];

const series: ChartSeries<Month>[] = [
  { id: 'photos', label: 'Photos', value: 'photos' },
  { id: 'videos', label: 'Videos', value: 'videos' },
  { id: 'documents', label: 'Documents', value: 'documents' },
];

export default function AreaChartStacked() {
  return (
    <div className="w-full max-w-xl">
      <AreaChart
        aria-label="Storage used by file type"
        data={data}
        category="month"
        series={series}
        layout="stacked"
        valueFormatOptions={{ style: 'unit', unit: 'gigabyte' }}
      />
    </div>
  );
}
