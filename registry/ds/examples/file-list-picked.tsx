'use client';

import { useState } from 'react';
import { FileList, type FileListEntry } from '@/registry/ds/ui/file-list';

const initial: FileListEntry[] = [
  { id: 'cover', file: { name: 'cover.png', size: 1_400_000 } },
  { id: 'chapter-one', file: { name: 'chapter-one.md', size: 12_800 } },
  { id: 'sources', file: { name: 'sources.zip', size: 8_300_000 } },
];

export default function FileListPicked() {
  const [items, setItems] = useState(initial);

  return (
    <FileList
      aria-label="Attachments"
      className="max-w-md"
      items={items}
      onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))}
      renderEmptyState={() => (
        <p className="py-6 text-center text-sm text-on-surface-variant">No attachments</p>
      )}
    />
  );
}
