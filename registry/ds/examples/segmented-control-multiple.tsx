'use client';

import { useId } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function SegmentedControlMultiple() {
  const labelId = useId();

  return (
    <div className="flex flex-col items-center gap-2">
      <p id={labelId} className="text-label-lg text-on-surface">
        Send overdue reminders by
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
      <p className="text-body-sm text-on-surface-variant">
        With none selected, no reminders go out.
      </p>
    </div>
  );
}
