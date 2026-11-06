'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

const statuses = [
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'overdue', label: 'Overdue' },
];

const list = new Intl.ListFormat('en', { type: 'conjunction' });

export default function SegmentedControlControlled() {
  const [selected, setSelected] = useState<Set<Key>>(new Set(['pending', 'overdue']));
  const names = statuses
    .filter((status) => selected.has(status.id))
    .map((status) => status.label.toLowerCase());

  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl
        aria-label="Invoice status"
        size="sm"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        {statuses.map((status) => (
          <SegmentedControlItem key={status.id} id={status.id}>
            {status.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {names.length ? `Showing ${list.format(names)} invoices` : 'Showing all invoices'}
      </p>
    </div>
  );
}
