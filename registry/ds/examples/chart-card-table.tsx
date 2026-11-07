'use client';

import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import { useIcons } from '@/registry/ds/ui/ds-provider';
import { IconButton } from '@/registry/ds/ui/icon-button';

const data = [
  { month: 'Jan', photos: 412, videos: 96 },
  { month: 'Feb', photos: 388, videos: 104 },
  { month: 'Mar', photos: 455, videos: 131 },
  { month: 'Apr', photos: 502, videos: 120 },
  { month: 'May', photos: 534, videos: 148 },
  { month: 'Jun', photos: 571, videos: 166 },
];

export default function ChartCardTable() {
  const icons = useIcons();

  return (
    <ChartCard
      className="w-full max-w-xl"
      title="Uploads"
      description="Photos and videos per month"
      showTableToggle
      actions={
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Download data"
          icon={<icons.download />}
        />
      }
    >
      <BarChart
        data={data}
        category="month"
        series={[
          { id: 'photos', label: 'Photos', value: 'photos' },
          { id: 'videos', label: 'Videos', value: 'videos' },
        ]}
        layout="stacked"
        legend="top"
      />
    </ChartCard>
  );
}
