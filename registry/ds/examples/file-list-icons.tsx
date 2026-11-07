import { FileIcon } from '@/registry/ds/ui/file-list';

const files = [
  'holiday.png',
  'trailer.mp4',
  'podcast.mp3',
  'manual.pdf',
  'chapter.docx',
  'results.csv',
  'keynote.pptx',
  'backup.zip',
  'app.tsx',
  'README',
];

export default function FileListIcons() {
  return (
    <ul className="grid w-full max-w-lg grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-x-3 gap-y-5">
      {files.map((name) => (
        <li key={name} className="flex min-w-0 flex-col items-center gap-2">
          <FileIcon file={{ name }} />
          <span className="max-w-full truncate text-xs text-on-surface-variant">{name}</span>
        </li>
      ))}
    </ul>
  );
}
