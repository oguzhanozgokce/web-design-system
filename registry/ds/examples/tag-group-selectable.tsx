'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { Tag, TagGroup } from '@/registry/ds/ui/tag';

const events = [
  { id: 'payment', name: 'Payment received' },
  { id: 'overdue', name: 'Invoice overdue' },
  { id: 'member', name: 'New team member' },
  { id: 'summary', name: 'Weekly summary' },
];

export default function TagGroupSelectable() {
  const [selected, setSelected] = useState<Selection>(new Set(['payment', 'overdue']));
  const count = selected === 'all' ? events.length : selected.size;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <TagGroup
        label="Email me when"
        variant="outlined"
        tone="primary"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        items={events}
      >
        {(event) => <Tag id={event.id}>{event.name}</Tag>}
      </TagGroup>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {count} of {events.length} notifications on
      </p>
    </div>
  );
}
