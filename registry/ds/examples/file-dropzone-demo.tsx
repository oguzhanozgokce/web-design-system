'use client';

import { useState } from 'react';
import { FileDropzone } from '@/registry/ds/ui/file-dropzone';

export default function FileDropzoneDemo() {
  const [names, setNames] = useState<string[]>([]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <FileDropzone
        acceptedFileTypes={['image/*']}
        maxSize={5_000_000}
        allowsMultiple
        onSelect={(files) => setNames(files.map((file) => file.name))}
      />
      <p className="min-h-5 truncate text-sm text-on-surface-variant">
        {names.length ? `Added ${names.join(', ')}` : 'No photos added yet'}
      </p>
    </div>
  );
}
