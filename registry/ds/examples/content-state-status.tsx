'use client';

import { useState } from 'react';
import { ContentState, type ContentStatus } from '@/registry/ds/ui/content-state';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

const statuses: { id: ContentStatus; label: string }[] = [
  { id: 'loading', label: 'Loading' },
  { id: 'error', label: 'Error' },
  { id: 'empty', label: 'Empty' },
  { id: 'content', label: 'Content' },
];

const members = ['Ayşe Demir · Admin', 'Jonas Weber · Member', 'Lucía Romero · Member'];

export default function ContentStateStatus() {
  const [status, setStatus] = useState<ContentStatus>('loading');

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <SegmentedControl
        aria-label="Status"
        size="sm"
        fullWidth
        selectedKeys={[status]}
        onSelectionChange={(keys) => {
          const next = statuses.find((option) => keys.has(option.id));
          if (next) setStatus(next.id);
        }}
      >
        {statuses.map((option) => (
          <SegmentedControlItem key={option.id} id={option.id}>
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <ContentState
        status={status}
        headingLevel={3}
        onRetry={() => setStatus('content')}
        emptyTitle="No members yet"
        emptyDescription="People you invite appear here."
        className="rounded-lg border border-outline-variant bg-surface"
      >
        <ul className="flex flex-col p-2">
          {members.map((member) => (
            <li key={member} className="px-2 py-3 text-body-md text-on-surface">
              {member}
            </li>
          ))}
        </ul>
      </ContentState>
    </div>
  );
}
