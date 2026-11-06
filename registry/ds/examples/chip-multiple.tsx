'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

const channels = [
  { id: 'email', name: 'Email' },
  { id: 'sms', name: 'SMS' },
  { id: 'push', name: 'Push' },
  { id: 'slack', name: 'Slack' },
];

export default function ChipMultiple() {
  const [selected, setSelected] = useState<Selection>(new Set(['email', 'push']));
  const names = channels.filter(({ id }) => selected === 'all' || selected.has(id));

  return (
    <div className="flex flex-col items-start gap-3">
      <ChipGroup
        label="Send payment reminders by"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        items={channels}
      >
        {(channel) => <Chip id={channel.id}>{channel.name}</Chip>}
      </ChipGroup>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {names.length ? names.map(({ name }) => name).join(', ') : 'Reminders are off'}
      </p>
    </div>
  );
}
