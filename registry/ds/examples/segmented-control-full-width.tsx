'use client';

import { useId } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlFullWidth() {
  const timeFormatId = useId();
  const weekStartId = useId();

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface-container-low p-4 text-on-surface">
      <h3 className="text-title-md">Date and time</h3>
      <div className="flex flex-col gap-2">
        <span id={timeFormatId} className="text-label-lg">
          Time format
        </span>
        <SegmentedControl
          aria-labelledby={timeFormatId}
          variant="thumb"
          fullWidth
          defaultSelectedKeys={['24h']}
        >
          <SegmentedControlItem id="12h">12-hour</SegmentedControlItem>
          <SegmentedControlItem id="24h">24-hour</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div className="flex flex-col gap-2">
        <span id={weekStartId} className="text-label-lg">
          Week starts on
        </span>
        <SegmentedControl aria-labelledby={weekStartId} fullWidth defaultSelectedKeys={['monday']}>
          <SegmentedControlItem id="saturday">Saturday</SegmentedControlItem>
          <SegmentedControlItem id="sunday">Sunday</SegmentedControlItem>
          <SegmentedControlItem id="monday">Monday</SegmentedControlItem>
        </SegmentedControl>
      </div>
    </div>
  );
}
