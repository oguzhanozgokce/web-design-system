'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/registry/ds/ui/data-table';
import type { StatusDefinitions } from '@/registry/ds/ui/status-tag';

interface Release {
  id: string;
  app: string;
  version: string;
  rollout: string;
  status: string;
}

const rollouts: StatusDefinitions = {
  full: { tone: 'success', label: 'Full rollout' },
  staged: { tone: 'warning', label: 'Staged' },
  halted: { tone: 'error', label: 'Halted' },
};

const initialReleases: Release[] = [
  { id: 'photos', app: 'Photos', version: '4.2.0', rollout: 'full', status: 'live' },
  { id: 'notes', app: 'Notes', version: '2.8.1', rollout: 'staged', status: 'live' },
  { id: 'weather', app: 'Weather', version: '1.9.4', rollout: 'halted', status: 'paused' },
  { id: 'music', app: 'Music', version: '3.0.0', rollout: 'staged', status: 'inReview' },
];

export default function DataTableEditable() {
  const [releases, setReleases] = useState(initialReleases);

  const columns: DataTableColumn<Release>[] = [
    { id: 'app', header: 'App', isRowHeader: true },
    { id: 'version', header: 'Version', chip: true },
    {
      id: 'rollout',
      header: 'Rollout',
      type: 'status',
      statuses: rollouts,
      onStatusChange: (release, rollout) =>
        setReleases((current) =>
          current.map((item) => (item.id === release.id ? { ...item, rollout } : item)),
        ),
    },
    { id: 'status', header: 'Status', type: 'status' },
  ];

  return (
    <DataTable
      aria-label="Releases"
      data={releases}
      columns={columns}
      getRowId={(release) => release.id}
      showSearch={false}
      paging={false}
      labels={{ resultCount: '{count} releases' }}
    />
  );
}
