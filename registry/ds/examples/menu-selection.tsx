'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { TuneIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  Menu,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from '@/registry/ds/ui/menu';

const sortLabels: Record<string, string> = {
  'sort-name': 'Name',
  'sort-modified': 'Date modified',
  'sort-size': 'Size',
};

export default function MenuSelection() {
  const [sort, setSort] = useState<Selection>(new Set(['sort-modified']));
  const [columns, setColumns] = useState<Selection>(new Set(['owner', 'modified', 'size']));
  const sortKey = [...sort][0];
  const columnCount = columns === 'all' ? 4 : columns.size;

  return (
    <div className="flex flex-col items-center gap-3">
      <MenuTrigger>
        <Button variant="outlined" startIcon={<TuneIcon />}>
          View
        </Button>
        <Menu>
          <MenuSection
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={sort}
            onSelectionChange={setSort}
          >
            <MenuHeader>Sort by</MenuHeader>
            {Object.entries(sortLabels).map(([id, label]) => (
              <MenuItem key={id} id={id}>
                {label}
              </MenuItem>
            ))}
          </MenuSection>
          <MenuSeparator />
          <MenuSection
            selectionMode="multiple"
            selectedKeys={columns}
            onSelectionChange={setColumns}
          >
            <MenuHeader>Columns</MenuHeader>
            <MenuItem id="owner">Owner</MenuItem>
            <MenuItem id="modified">Date modified</MenuItem>
            <MenuItem id="size">Size</MenuItem>
            <MenuItem id="type">Type</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Sorted by {sortLabels[String(sortKey)]?.toLowerCase()}, {columnCount} columns shown
      </p>
    </div>
  );
}
