'use client';

import { useState } from 'react';
import { FileTrigger } from 'react-aria-components';
import { UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';

export default function FileDropzoneTrigger() {
  const [name, setName] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-on-surface">Profile photo</span>
        <span className="truncate text-xs text-on-surface-variant">
          {name ?? 'PNG or JPG, up to 2 MB'}
        </span>
      </div>
      <FileTrigger
        acceptedFileTypes={['image/png', 'image/jpeg']}
        onSelect={(files) => setName(files?.[0]?.name ?? null)}
      >
        <Button variant="outline" size="sm" startIcon={<UploadIcon />}>
          Choose file
        </Button>
      </FileTrigger>
    </div>
  );
}
