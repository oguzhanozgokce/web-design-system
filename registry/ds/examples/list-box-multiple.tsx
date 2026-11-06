'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

const fruits = [
  { id: 'apple', name: 'Apple' },
  { id: 'banana', name: 'Banana' },
  { id: 'cherry', name: 'Cherry' },
  { id: 'grape', name: 'Grape' },
  { id: 'mango', name: 'Mango' },
  { id: 'orange', name: 'Orange' },
];

export default function ListBoxMultiple() {
  const [selected, setSelected] = useState<Selection>(new Set(['apple', 'banana', 'mango']));
  const count = selected === 'all' ? fruits.length : selected.size;

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <ListBox
        aria-label="Fruits"
        items={fruits}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        variant="outlined"
      >
        {(fruit) => <ListBoxItem>{fruit.name}</ListBoxItem>}
      </ListBox>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {count} of {fruits.length} selected
      </p>
    </div>
  );
}
