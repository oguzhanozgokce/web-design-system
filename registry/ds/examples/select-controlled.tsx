'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

const zones = [
  { id: 'Europe/London', name: 'London (GMT+0)' },
  { id: 'Africa/Nairobi', name: 'Nairobi (GMT+3)' },
  { id: 'Asia/Tokyo', name: 'Tokyo (GMT+9)' },
  { id: 'America/New_York', name: 'New York (GMT−5)' },
];

export default function SelectControlled() {
  const [zone, setZone] = useState<Key | null>('Asia/Tokyo');
  const name = zones.find((item) => item.id === zone)?.name;

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Select label="Time zone" items={zones} value={zone} onChange={setZone}>
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
      </Select>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Times are shown in {name}.
      </p>
    </div>
  );
}
