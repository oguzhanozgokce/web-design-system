'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

const views = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export default function ToggleButtonGroupDemo() {
  const [selected, setSelected] = useState<Set<Key>>(new Set(['week']));
  const view = views.find((item) => selected.has(item.id)) ?? views[0];

  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleButtonGroup
        aria-label="Calendar view"
        disallowEmptySelection
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        {views.map((item) => (
          <ToggleButton key={item.id} id={item.id}>
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        Showing the {view.label} view
      </p>
    </div>
  );
}
