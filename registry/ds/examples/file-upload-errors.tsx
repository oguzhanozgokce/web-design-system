'use client';

import { FileUpload, FileUploadError, type FileUploadContext } from '@/registry/ds/ui/file-upload';

let attempts = 0;

function sendFile(_file: File, { signal, onProgress }: FileUploadContext) {
  const fails = attempts++ % 2 === 0;
  return new Promise<void>((resolve, reject) => {
    let sent = 0;
    const timer = setInterval(() => {
      sent = Math.min(fails ? 0.62 : 1, sent + 0.05 + Math.random() * 0.06);
      onProgress(sent);
      if (fails && sent >= 0.62) {
        clearInterval(timer);
        reject(new FileUploadError('Connection lost'));
      } else if (sent >= 1) {
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

export default function FileUploadErrors() {
  return <FileUpload className="max-w-md" size="sm" allowsMultiple onUpload={sendFile} />;
}
