'use client';

import { useState } from 'react';
import { ReorderableList } from '@/registry/ds/ui/reorderable-list';
import { Switch } from '@/registry/ds/ui/switch';

const initial = [
  {
    id: 'activity',
    title: 'Recent activity',
    detail: 'Updates from across your workspace',
    enabled: true,
  },
  { id: 'tasks', title: 'My tasks', detail: 'A little focus for the day ahead', enabled: true },
  { id: 'bookmarks', title: 'Bookmarks', detail: 'Links you want to keep close', enabled: false },
];

export default function ReorderableListPlain() {
  const [items, setItems] = useState(initial);
  return (
    <div className="mx-auto w-full max-w-lg">
      <h3 className="text-lg font-semibold text-on-surface">Make space for your work</h3>
      <p className="mt-1 mb-5 text-sm text-on-surface-variant">
        Choose what appears on your home screen, then set the order.
      </p>
      <ReorderableList
        aria-label="Home screen sections"
        value={items}
        onChange={setItems}
        getKey={(item) => item.id}
        getTextValue={(item) => item.title}
        variant="plain"
      >
        {(item) => (
          <>
            <div className="min-w-0 flex-1 py-1">
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{item.detail}</p>
            </div>
            <Switch
              aria-label={`Show ${item.title}`}
              isSelected={item.enabled}
              onChange={(enabled) =>
                setItems((current) =>
                  current.map((entry) => (entry.id === item.id ? { ...entry, enabled } : entry)),
                )
              }
            />
          </>
        )}
      </ReorderableList>
    </div>
  );
}
