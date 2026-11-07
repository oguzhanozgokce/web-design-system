'use client';

import { useState } from 'react';
import { DescriptionIcon, EventIcon, FolderIcon, ImageIcon } from '@/registry/ds/lib/icons';
import { FabMenu, FabMenuItem } from '@/registry/ds/ui/fab';

const actions: Record<string, string> = {
  document: 'New document',
  photo: 'Upload photo',
  folder: 'New folder',
  event: 'New event',
};

export default function FabMenuExample() {
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="relative flex h-96 w-full max-w-sm flex-col justify-between rounded-container border border-outline-subtle bg-canvas p-4">
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {last ? `Last action: ${actions[last]}` : 'No action yet'}
      </p>
      <FabMenu aria-label="Create" className="self-end" onAction={(key) => setLast(String(key))}>
        <FabMenuItem id="document" icon={<DescriptionIcon />}>
          {actions.document}
        </FabMenuItem>
        <FabMenuItem id="photo" icon={<ImageIcon />}>
          {actions.photo}
        </FabMenuItem>
        <FabMenuItem id="folder" icon={<FolderIcon />}>
          {actions.folder}
        </FabMenuItem>
        <FabMenuItem id="event" icon={<EventIcon />}>
          {actions.event}
        </FabMenuItem>
      </FabMenu>
    </div>
  );
}
