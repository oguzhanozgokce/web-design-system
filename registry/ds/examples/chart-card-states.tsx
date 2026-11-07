'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { BarChart } from '@/registry/ds/ui/bar-chart';
import { ChartCard } from '@/registry/ds/ui/chart-card';
import type { ContentStatus } from '@/registry/ds/ui/content-state';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

const data = [
  { day: 'Mon', builds: 32 },
  { day: 'Tue', builds: 41 },
  { day: 'Wed', builds: 38 },
  { day: 'Thu', builds: 45 },
  { day: 'Fri', builds: 51 },
];

export default function ChartCardStates() {
  const [status, setStatus] = useState<Key>('loading');

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <SegmentedControl
        size="sm"
        aria-label="Status"
        selectedKeys={[status]}
        onSelectionChange={(keys) => setStatus([...keys][0] ?? 'content')}
        className="self-start"
      >
        <SegmentedControlItem id="loading">Loading</SegmentedControlItem>
        <SegmentedControlItem id="empty">Empty</SegmentedControlItem>
        <SegmentedControlItem id="error">Error</SegmentedControlItem>
        <SegmentedControlItem id="content">Content</SegmentedControlItem>
      </SegmentedControl>
      <ChartCard
        title="Builds"
        description="This week"
        value={207}
        status={status as ContentStatus}
        onRetry={() => setStatus('content')}
      >
        <BarChart
          data={data}
          category="day"
          series={[{ id: 'builds', label: 'Builds', value: 'builds' }]}
        />
      </ChartCard>
    </div>
  );
}
