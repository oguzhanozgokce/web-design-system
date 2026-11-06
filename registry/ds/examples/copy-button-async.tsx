'use client';

import { CopyButton } from '@/registry/ds/ui/copy-button';

async function createShareLink() {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return 'https://app.example.com/s/q3-revenue-report';
}

export default function CopyButtonAsync() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <CopyButton value={createShareLink} variant="filled">
        Copy share link
      </CopyButton>
      <p className="text-body-sm text-on-surface-variant">
        Creates a read-only link to the Q3 revenue report.
      </p>
    </div>
  );
}
