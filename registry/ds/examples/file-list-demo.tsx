'use client';

import { useEffect, useState } from 'react';
import { FileList, type FileListEntry } from '@/registry/ds/ui/file-list';

const initial: FileListEntry[] = [
  {
    id: 'beach',
    file: { name: 'beach-at-sunrise.jpg', size: 3_200_000, type: 'image/jpeg' },
    status: 'complete',
  },
  {
    id: 'interview',
    file: { name: 'team-interview.mp4', size: 48_600_000, type: 'video/mp4' },
    status: 'uploading',
    progress: 0.18,
  },
  {
    id: 'notes',
    file: { name: 'meeting-notes.pdf', size: 420_000, type: 'application/pdf' },
    status: 'error',
    error: 'Connection lost',
  },
  {
    id: 'plan',
    file: { name: 'project-plan.xlsx', size: 96_000 },
    status: 'queued',
  },
];

function advance(item: FileListEntry): FileListEntry {
  if (item.status !== 'uploading') return item;
  const progress = Math.min(1, (item.progress ?? 0) + 0.04 + Math.random() * 0.08);
  return progress >= 1 ? { ...item, status: 'complete', progress: 1 } : { ...item, progress };
}

export default function FileListDemo() {
  const [items, setItems] = useState(initial);
  const running = items.some((item) => item.status === 'uploading');

  useEffect(() => {
    if (running) {
      const timer = setInterval(() => setItems((current) => current.map(advance)), 700);
      return () => clearInterval(timer);
    }
    const restart = setTimeout(
      () =>
        setItems((current) =>
          current.map((item) =>
            item.id === 'interview' ? { ...item, status: 'uploading', progress: 0.02 } : item,
          ),
        ),
      2400,
    );
    return () => clearTimeout(restart);
  }, [running]);

  return (
    <FileList
      className="max-w-md"
      items={items}
      onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))}
      onCancel={(id) => setItems((current) => current.filter((item) => item.id !== id))}
      onRetry={(id) =>
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: 'uploading', progress: 0.02, error: undefined }
              : item,
          ),
        )
      }
    />
  );
}
