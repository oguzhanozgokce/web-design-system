'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

const revenue: Record<string, { total: string; note: string }> = {
  weekly: { total: '€3,120', note: 'Week 45, up 4% on last week' },
  monthly: { total: '€12,480', note: 'October, up 8% on September' },
  yearly: { total: '€131,900', note: '2026 so far, up 21% on 2025' },
};

export default function SegmentedControlThumb() {
  const [period, setPeriod] = useState<Key>('monthly');
  const current = revenue[String(period)];

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-surface-container-low p-4 text-on-surface">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-title-md">Revenue</h3>
        <SegmentedControl
          aria-label="Revenue period"
          variant="thumb"
          size="sm"
          selectedKeys={[period]}
          onSelectionChange={(keys) => {
            const [next] = keys;
            if (next != null) setPeriod(next);
          }}
        >
          <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
          <SegmentedControlItem id="monthly">Monthly</SegmentedControlItem>
          <SegmentedControlItem id="yearly">Yearly</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div>
        <p className="text-headline-sm tabular-digits">{current.total}</p>
        <p className="text-body-sm text-on-surface-variant">{current.note}</p>
      </div>
    </div>
  );
}
