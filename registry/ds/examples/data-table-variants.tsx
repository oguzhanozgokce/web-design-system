'use client';

import { useState } from 'react';
import {
  DataTable,
  type DataTableColumn,
  type DataTableVariant,
} from '@/registry/ds/ui/data-table';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

interface Folder {
  id: string;
  name: string;
  files: number;
  size: number;
  status: string;
}

const folders: Folder[] = [
  { id: 'photos', name: 'Photos', files: 2481, size: 18.4, status: 'completed' },
  { id: 'documents', name: 'Documents', files: 312, size: 1.2, status: 'processing' },
  { id: 'music', name: 'Music', files: 1045, size: 7.9, status: 'paused' },
  { id: 'videos', name: 'Videos', files: 96, size: 42.6, status: 'pending' },
];

const columns: DataTableColumn<Folder>[] = [
  { id: 'name', header: 'Folder', isRowHeader: true, allowsSorting: true },
  { id: 'files', header: 'Files', type: 'number', allowsSorting: true },
  {
    id: 'size',
    header: 'Size',
    type: 'number',
    allowsSorting: true,
    formatOptions: { style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 },
  },
  { id: 'status', header: 'Sync', type: 'status' },
];

export default function DataTableVariants() {
  const [variant, setVariant] = useState<DataTableVariant>('outline');

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <SegmentedControl
        aria-label="Variant"
        size="sm"
        selectedKeys={[variant]}
        onSelectionChange={(keys) => {
          const next = [...keys][0];
          if (next) setVariant(next as DataTableVariant);
        }}
      >
        <SegmentedControlItem id="outline">Outline</SegmentedControlItem>
        <SegmentedControlItem id="elevated">Elevated</SegmentedControlItem>
        <SegmentedControlItem id="transparent">Transparent</SegmentedControlItem>
      </SegmentedControl>
      <DataTable
        aria-label="Storage"
        variant={variant}
        data={folders}
        columns={columns}
        getRowId={(folder) => folder.id}
        showSearch={false}
        paging={false}
        labels={{ totalResults: 'Storage', resultCount: '{count} folders' }}
      />
    </div>
  );
}
