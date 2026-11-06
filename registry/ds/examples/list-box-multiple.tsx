'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

const columns = [
  { id: 'date', name: 'Date' },
  { id: 'description', name: 'Description' },
  { id: 'category', name: 'Category' },
  { id: 'amount', name: 'Amount' },
  { id: 'status', name: 'Status' },
  { id: 'receipt', name: 'Receipt' },
];

export default function ListBoxMultiple() {
  const [selected, setSelected] = useState<Selection>(new Set(['date', 'description', 'amount']));
  const count = selected === 'all' ? columns.length : selected.size;

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <ListBox
        aria-label="Visible columns"
        items={columns}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        variant="outlined"
      >
        {(column) => <ListBoxItem>{column.name}</ListBoxItem>}
      </ListBox>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Showing {count} of {columns.length} columns
      </p>
    </div>
  );
}
