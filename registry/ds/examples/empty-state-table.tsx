'use client';

import { useState } from 'react';
import { FilterIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

const tasks = [
  { id: 'review', name: 'Design review', owner: 'Ayşe Demir', status: 'Done' },
  { id: 'docs', name: 'Update the docs', owner: 'Jonas Weber', status: 'In progress' },
  { id: 'launch', name: 'Plan the launch', owner: 'Priya Natarajan', status: 'To do' },
];

export default function EmptyStateTable() {
  const [isFiltered, setFiltered] = useState(true);
  const rows = isFiltered ? [] : tasks;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant bg-surface">
      <table className="w-full text-start text-body-md text-on-surface">
        <caption className="px-4 pt-3 text-start text-title-sm">
          Tasks {isFiltered ? '· Status: Blocked' : ''}
        </caption>
        <thead className="text-label-lg text-on-surface-variant">
          <tr className="border-b border-outline-variant">
            <th scope="col" className="px-4 py-3 text-start font-medium">
              Task
            </th>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              Owner
            </th>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((task) => (
              <tr key={task.id} className="border-b border-outline-variant last:border-0">
                <td className="px-4 py-3">{task.name}</td>
                <td className="px-4 py-3">{task.owner}</td>
                <td className="px-4 py-3">{task.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>
                <EmptyState
                  size="compact"
                  headingLevel={3}
                  icon={<FilterIcon />}
                  title="No blocked tasks"
                  description="Tasks that wait on someone else show up here."
                  primaryAction={<Button onPress={() => setFiltered(false)}>Clear filter</Button>}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isFiltered ? null : (
        <div className="flex justify-end p-2">
          <Button variant="text" size="sm" onPress={() => setFiltered(true)}>
            Show blocked only
          </Button>
        </div>
      )}
    </div>
  );
}
