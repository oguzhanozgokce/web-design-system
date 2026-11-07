'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import type { ChartCurve } from '@/registry/ds/lib/chart';
import { LineChart } from '@/registry/ds/ui/line-chart';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

const data = [
  { day: 'Mon', minutes: 22 },
  { day: 'Tue', minutes: 31 },
  { day: 'Wed', minutes: 27 },
  { day: 'Thu', minutes: 44 },
  { day: 'Fri', minutes: 38 },
  { day: 'Sat', minutes: 52 },
  { day: 'Sun', minutes: 47 },
];

export default function LineChartCurves() {
  const [curve, setCurve] = useState<Key>('monotone');

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <SegmentedControl
        size="sm"
        aria-label="Curve"
        selectedKeys={[curve]}
        onSelectionChange={(keys) => setCurve([...keys][0] ?? 'monotone')}
        className="self-start"
      >
        <SegmentedControlItem id="monotone">Monotone</SegmentedControlItem>
        <SegmentedControlItem id="linear">Linear</SegmentedControlItem>
        <SegmentedControlItem id="step">Step</SegmentedControlItem>
      </SegmentedControl>
      <LineChart
        aria-label="Listening time per day"
        data={data}
        category="day"
        series={[{ id: 'minutes', label: 'Minutes', value: 'minutes' }]}
        curve={curve as ChartCurve}
        dots="all"
      />
    </div>
  );
}
