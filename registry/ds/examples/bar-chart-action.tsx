'use client';

import { useState } from 'react';
import { BarChart } from '@/registry/ds/ui/bar-chart';

const data = [
  { team: 'Design', tasks: 18 },
  { team: 'Research', tasks: 11 },
  { team: 'Mobile', tasks: 24 },
  { team: 'Web', tasks: 29 },
  { team: 'Support', tasks: 15 },
];

export default function BarChartAction() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <BarChart
        aria-label="Open tasks by team"
        data={data}
        category="team"
        series={[{ id: 'tasks', label: 'Open tasks', value: 'tasks' }]}
        onAction={(point) => setSelected(point.label)}
      />
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {selected ? `Showing tasks for ${selected}` : 'Press a bar to filter the task list.'}
      </p>
    </div>
  );
}
