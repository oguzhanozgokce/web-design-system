'use client';

import { useState } from 'react';
import { useLocale, type Key } from 'react-aria-components';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

const statuses = [
  { id: 'paid', label: 'Paid', count: 128 },
  { id: 'pending', label: 'Pending', count: 14 },
  { id: 'refunded', label: 'Refunded', count: 6 },
  { id: 'disputed', label: 'Disputed', count: 2 },
];

export default function ToggleButtonGroupMultiple() {
  const { locale } = useLocale();
  const [selected, setSelected] = useState<Set<Key>>(new Set(['pending', 'disputed']));
  const shown = statuses
    .filter((status) => selected.has(status.id))
    .reduce((sum, status) => sum + status.count, 0);
  const count = new Intl.NumberFormat(locale).format(shown);

  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleButtonGroup
        aria-label="Order status"
        selectionMode="multiple"
        variant="standard"
        buttonVariant="outlined"
        size="sm"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        className="justify-center"
      >
        {statuses.map((status) => (
          <ToggleButton key={status.id} id={status.id}>
            {status.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Showing {count} orders
      </p>
    </div>
  );
}
