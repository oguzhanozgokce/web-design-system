'use client';

import { useState } from 'react';
import { CopyButton } from '@/registry/ds/ui/copy-button';

const folders = [
  { name: 'Photos', link: 'https://example.com/s/photos' },
  { name: 'Videos', link: 'https://example.com/s/videos' },
  { name: 'Music', link: 'https://example.com/s/music' },
];

export default function CopyButtonTable() {
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <ul className="divide-y divide-outline-variant rounded-md border border-outline-variant">
        {folders.map((folder) => (
          <li key={folder.name} className="flex items-center gap-3 py-2 ps-4 pe-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-md text-on-surface">{folder.name}</span>
              <span className="truncate font-mono text-body-sm text-on-surface-variant">
                {folder.link}
              </span>
            </div>
            <CopyButton
              value={folder.link}
              aria-label={`Copy link to ${folder.name}`}
              onCopy={setLastCopied}
            />
          </li>
        ))}
      </ul>
      <p className="text-body-sm text-on-surface-variant">
        {lastCopied ? `Last copied: ${lastCopied}` : 'Nothing copied yet'}
      </p>
    </div>
  );
}
