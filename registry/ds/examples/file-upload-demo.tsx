'use client';

import { FileUpload, type FileUploadContext } from '@/registry/ds/ui/file-upload';

function sendFile(file: File, { signal, onProgress }: FileUploadContext) {
  return new Promise<void>((resolve, reject) => {
    let sent = 0;
    const seconds = 1.6 + Math.min(file.size / 5_000_000, 1) * 2.4;
    const timer = setInterval(() => {
      sent = Math.min(1, sent + (0.1 / seconds) * (0.4 + Math.random() * 1.2));
      onProgress(sent);
      if (sent >= 1) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
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

export default function FileUploadDemo() {
  return (
    <FileUpload
      className="max-w-md"
      allowsMultiple
      maxFiles={6}
      maxSize={20_000_000}
      onUpload={sendFile}
      defaultValue={[
        {
          id: 'mountains',
          file: { name: 'mountains.jpg', size: 2_400_000, type: 'image/jpeg' },
          status: 'complete',
        },
      ]}
    />
  );
}
