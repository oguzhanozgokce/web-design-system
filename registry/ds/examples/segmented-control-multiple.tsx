'use client';

import { useId } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlMultiple() {
  const labelId = useId();

  return (
    <div className="flex flex-col items-center gap-2">
      <p id={labelId} className="text-sm font-medium text-on-surface">
        Notify me by
      </p>
      <SegmentedControl
        aria-labelledby={labelId}
        selectionMode="multiple"
        defaultSelectedKeys={['email', 'push']}
      >
        <SegmentedControlItem id="email">Email</SegmentedControlItem>
        <SegmentedControlItem id="sms">SMS</SegmentedControlItem>
        <SegmentedControlItem id="push">Push</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-xs text-on-surface-variant">
        With none selected, you get no notifications.
      </p>
    </div>
  );
}
