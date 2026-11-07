'use client';

import { useState } from 'react';
import { FileDropzone, type FileRejection } from '@/registry/ds/ui/file-dropzone';

const reasons: Record<FileRejection['reason'], string> = {
  type: 'wrong type',
  'too-large': 'too large',
  'too-small': 'too small',
  'too-many': 'over the limit',
};

export default function FileDropzoneRestrictions() {
  const [log, setLog] = useState<string[]>([]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <FileDropzone
        acceptedFileTypes={['image/png', 'image/jpeg', '.pdf']}
        maxSize={2_000_000}
        maxFiles={3}
        allowsMultiple
        onSelect={(files) => setLog(files.map((file) => `${file.name}: added`))}
        onReject={(rejections) =>
          setLog(rejections.map(({ file, reason }) => `${file.name}: ${reasons[reason]}`))
        }
      />
      <ul className="flex min-h-5 flex-col gap-1 text-sm text-on-surface-variant">
        {log.map((line) => (
          <li key={line} className="truncate">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
