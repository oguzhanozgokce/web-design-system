'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { FileUpload, type FileUploadItem } from '@/registry/ds/ui/file-upload';

export default function FileUploadCollect() {
  const [items, setItems] = useState<FileUploadItem[]>([]);
  const [sent, setSent] = useState<number | null>(null);

  return (
    <form
      className="flex w-full max-w-md flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(items.length);
      }}
    >
      <FileUpload
        label="Attachments"
        size="sm"
        allowsMultiple
        maxFiles={5}
        maxSize={10_000_000}
        value={items}
        onChange={setItems}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" isDisabled={items.length === 0}>
          Send
        </Button>
        <span className="text-sm text-on-surface-variant" aria-live="polite">
          {sent == null ? null : `Sent ${sent} ${sent === 1 ? 'file' : 'files'}`}
        </span>
      </div>
    </form>
  );
}
