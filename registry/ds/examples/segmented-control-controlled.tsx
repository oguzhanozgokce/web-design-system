'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

const types = [
  { id: 'photos', label: 'Photos' },
  { id: 'videos', label: 'Videos' },
  { id: 'music', label: 'Music' },
];

const list = new Intl.ListFormat('en', { type: 'conjunction' });

export default function SegmentedControlControlled() {
  const [selected, setSelected] = useState<Set<Key>>(new Set(['photos', 'videos']));
  const names = types
    .filter((type) => selected.has(type.id))
    .map((type) => type.label.toLowerCase());

  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl
        aria-label="Media types"
        size="sm"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        {types.map((type) => (
          <SegmentedControlItem key={type.id} id={type.id}>
            {type.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {names.length ? `Showing ${list.format(names)}` : 'Showing everything'}
      </p>
    </div>
  );
}
