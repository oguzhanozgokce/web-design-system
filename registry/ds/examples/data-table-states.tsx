'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/registry/ds/ui/data-table';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

interface Project {
  id: string;
  name: string;
  owner: string;
  status: string;
}

const projects: Project[] = [
  { id: 'atlas', name: 'Atlas', owner: 'Amara Okafor', status: 'active' },
  { id: 'harbor', name: 'Harbor', owner: 'Kenji Watanabe', status: 'pending' },
  { id: 'meadow', name: 'Meadow', owner: 'Sofia Rossi', status: 'completed' },
];

const columns: DataTableColumn<Project>[] = [
  { id: 'name', header: 'Project', isRowHeader: true },
  { id: 'owner', header: 'Owner' },
  { id: 'status', header: 'Status', type: 'status' },
];

type View = 'loading' | 'empty' | 'error' | 'data';

export default function DataTableStates() {
  const [view, setView] = useState<View>('loading');

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <SegmentedControl
        aria-label="State"
        size="sm"
        selectedKeys={[view]}
        onSelectionChange={(keys) => {
          const next = [...keys][0];
          if (next) setView(next as View);
        }}
      >
        <SegmentedControlItem id="loading">Loading</SegmentedControlItem>
        <SegmentedControlItem id="empty">Empty</SegmentedControlItem>
        <SegmentedControlItem id="error">Error</SegmentedControlItem>
        <SegmentedControlItem id="data">Data</SegmentedControlItem>
      </SegmentedControl>
      <DataTable
        aria-label="Projects"
        data={view === 'data' ? projects : []}
        columns={columns}
        getRowId={(project) => project.id}
        pageSize={3}
        isLoading={view === 'loading'}
        error={view === 'error' ? new Error('Offline') : undefined}
        onRetry={() => setView('data')}
        labels={{ resultCount: '{count} projects' }}
      />
    </div>
  );
}
