'use client';

import { useState } from 'react';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { Switch } from '@/registry/ds/ui/switch';

const data = [
  { month: 'Jan', photos: 412, videos: 96 },
  { month: 'Feb', photos: 388, videos: 104 },
  { month: 'Mar', photos: 455, videos: 131 },
  { month: 'Apr', photos: 502, videos: 120 },
  { month: 'May', photos: 534, videos: 148 },
];

export default function ChartTable() {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Switch isSelected={showTable} onChange={setShowTable}>
        Show as table
      </Switch>
      <BarChart
        aria-label="Uploads per month"
        data={data}
        category="month"
        series={[
          { id: 'photos', label: 'Photos', value: 'photos' },
          { id: 'videos', label: 'Videos', value: 'videos' },
        ]}
        view={showTable ? 'table' : 'chart'}
      />
    </div>
  );
}
