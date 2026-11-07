'use client';

import { FileUpload, type FileUploadContext } from '@/registry/ds/ui/file-upload';

function sendFile(file: File, { signal, onProgress }: FileUploadContext) {
  return new Promise<void>((resolve, reject) => {
    let sent = 0;
    const timer = setInterval(() => {
      sent = Math.min(1, sent + 0.04 + Math.random() * 0.08);
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

export default function FileUploadSingle() {
  return (
    <FileUpload
      className="max-w-sm"
      layout="single"
      label="Profile photo"
      acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp']}
      maxSize={2_000_000}
      onUpload={sendFile}
      defaultValue={[
        {
          id: 'portrait',
          file: { name: 'portrait.png', size: 820_000, type: 'image/png' },
          status: 'complete',
        },
      ]}
    />
  );
}
