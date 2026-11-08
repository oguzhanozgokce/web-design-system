'use client';

import { useState } from 'react';
import { DashboardIcon, FolderIcon, MailIcon, StarIcon, UndoIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ReorderableList } from '@/registry/ds/ui/reorderable-list';

const initial = [
  {
    id: 'overview',
    title: 'Overview',
    detail: 'The bigger picture, at a glance',
    icon: DashboardIcon,
    color: 'bg-primary-soft text-on-primary-soft',
  },
  {
    id: 'projects',
    title: 'Projects',
    detail: 'A home for work in progress',
    icon: FolderIcon,
    color: 'bg-info-soft text-on-info-soft',
  },
  {
    id: 'inbox',
    title: 'Inbox',
    detail: 'Conversations worth keeping',
    icon: MailIcon,
    color: 'bg-success-soft text-on-success-soft',
  },
  {
    id: 'saved',
    title: 'Saved',
    detail: 'Good things to come back to',
    icon: StarIcon,
    color: 'bg-warning-soft text-on-warning-soft',
  },
];

export default function ReorderableListDemo() {
  const [items, setItems] = useState(initial);
  const [previous, setPrevious] = useState<typeof initial>();
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-medium text-on-surface-variant">YOUR WORKSPACE</p>
          <h3 className="text-xl font-semibold tracking-tight text-on-surface">
            Put your day in order.
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">Keep what matters within reach.</p>
        </div>
        <span className="shrink-0 rounded-control bg-neutral-soft px-3 py-1 text-xs font-medium whitespace-nowrap text-on-surface">
          4 shortcuts
        </span>
      </div>
      <ReorderableList
        aria-label="Workspace shortcuts"
        value={items}
        onChange={(next) => {
          setPrevious(items);
          setItems(next);
        }}
        getKey={(item) => item.id}
        getTextValue={(item) => item.title}
      >
        {(item, index) => (
          <>
            <span
              aria-hidden="true"
              className={`flex size-11 shrink-0 items-center justify-center rounded-item ${item.color}`}
            >
              <item.icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{item.detail}</p>
            </div>
            <span aria-hidden="true" className="text-xs text-on-surface-variant tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
          </>
        )}
      </ReorderableList>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-on-surface-variant">
          Drag a row, or use its handle with a keyboard.
        </p>
        <Button
          variant="ghost"
          size="sm"
          startIcon={<UndoIcon />}
          isDisabled={!previous}
          onPress={() => {
            if (previous) setItems(previous);
            setPrevious(undefined);
          }}
        >
          Undo
        </Button>
      </div>
    </div>
  );
}
