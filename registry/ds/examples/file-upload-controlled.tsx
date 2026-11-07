'use client';

import { useState } from 'react';
import {
  FileUpload,
  type FileUploadContext,
  type FileUploadItem,
} from '@/registry/ds/ui/file-upload';

function sendFile(_file: File, { signal, onProgress }: FileUploadContext) {
  return new Promise<void>((resolve, reject) => {
    let sent = 0;
    const timer = setInterval(() => {
      sent = Math.min(1, sent + 0.03 + Math.random() * 0.07);
      onProgress(sent);
      if (sent >= 1) {
        clearInterval(timer);
        resolve();
      }
    }, 120);
    signal.addEventListener(
      'abort',
      () => {
        clearInterval(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

export default function FileUploadControlled() {
  const [items, setItems] = useState<FileUploadItem[]>([]);
  const done = items.filter((item) => item.status === 'complete').length;

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FileUpload
        allowsMultiple
        listVariant="soft"
        value={items}
        onChange={setItems}
        onUpload={sendFile}
        maxConcurrent={2}
      />
      <p className="text-sm text-on-surface-variant">
        {items.length === 0 ? 'Nothing uploaded yet' : `${done} of ${items.length} uploaded`}
      </p>
    </div>
  );
}
