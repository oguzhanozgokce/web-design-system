'use client';

import { DescriptionIcon, ImageIcon, PlayArrowIcon } from '@/registry/ds/lib/icons';
import { DataTable, type DataTableColumn } from '@/registry/ds/ui/data-table';

interface Download {
  id: string;
  name: string;
  kind: 'image' | 'video' | 'document';
  labels: string[];
  size: number;
  status: string;
  added: string;
}

const downloads: Download[] = [
  {
    id: 'trip',
    name: 'Trip to the coast.mp4',
    kind: 'video',
    labels: ['Shared', 'Offline', 'Family'],
    size: 842.5,
    status: 'processing',
    added: '2026-11-04',
  },
  {
    id: 'poster',
    name: 'Poster draft.png',
    kind: 'image',
    labels: ['Design'],
    size: 12.4,
    status: 'completed',
    added: '2026-11-02',
  },
  {
    id: 'guide',
    name: 'Setup guide.pdf',
    kind: 'document',
    labels: ['Docs', 'Pinned'],
    size: 3.1,
    status: 'failed',
    added: '2026-10-29',
  },
  {
    id: 'album',
    name: 'Album artwork.png',
    kind: 'image',
    labels: [],
    size: 6.8,
    status: 'paused',
    added: '2026-10-21',
  },
  {
    id: 'talk',
    name: 'Keynote talk.mp4',
    kind: 'video',
    labels: ['Shared'],
    size: 1290.2,
    status: 'pending',
    added: '2026-10-12',
  },
];

const kindIcon = { image: ImageIcon, video: PlayArrowIcon, document: DescriptionIcon };

const columns: DataTableColumn<Download>[] = [
  {
    id: 'name',
    header: 'File',
    isRowHeader: true,
    allowsSorting: true,
    cell: (file) => {
      const Icon = kindIcon[file.kind];
      return (
        <span className="flex items-center gap-2.5 font-medium">
          <Icon className="size-4 shrink-0 text-on-surface-variant" />
          {file.name}
        </span>
      );
    },
  },
  { id: 'labels', header: 'Labels', type: 'tags', maxVisibleTags: 2 },
  {
    id: 'size',
    header: 'Size',
    type: 'number',
    allowsSorting: true,
    formatOptions: { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 },
  },
  { id: 'status', header: 'Status', type: 'status', allowsSorting: true },
  {
    id: 'added',
    header: 'Added',
    type: 'date',
    allowsSorting: true,
    formatOptions: { dateStyle: 'medium', timeZone: 'UTC' },
  },
];

export default function DataTableColumns() {
  return (
    <DataTable
      aria-label="Downloads"
      data={downloads}
      columns={columns}
      getRowId={(file) => file.id}
      paging={false}
      labels={{ resultCount: '{count} files' }}
    />
  );
}
