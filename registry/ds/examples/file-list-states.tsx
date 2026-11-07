import { FileList, type FileListEntry } from '@/registry/ds/ui/file-list';

const items: FileListEntry[] = [
  { id: 'idle', file: { name: 'holiday-map.png', size: 640_000 } },
  { id: 'queued', file: { name: 'recipes.docx', size: 88_000 }, status: 'queued' },
  {
    id: 'measured',
    file: { name: 'concert.mov', size: 212_000_000 },
    status: 'uploading',
    progress: 0.64,
  },
  { id: 'unmeasured', file: { name: 'voice-memo.m4a', size: 2_100_000 }, status: 'uploading' },
  { id: 'complete', file: { name: 'slides.pptx', size: 5_400_000 }, status: 'complete' },
  {
    id: 'error',
    file: { name: 'archive.zip', size: 96_000_000 },
    status: 'error',
    error: 'Storage is full',
  },
];

export default function FileListStates() {
  return <FileList aria-label="Upload states" variant="soft" className="max-w-md" items={items} />;
}
