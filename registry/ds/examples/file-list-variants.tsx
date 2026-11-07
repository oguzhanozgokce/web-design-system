import { FileList, type FileListEntry } from '@/registry/ds/ui/file-list';

const items: FileListEntry[] = [
  { id: 'logo', file: { name: 'logo.svg', size: 18_000 }, status: 'complete' },
  { id: 'brief', file: { name: 'design-brief.docx', size: 240_000 }, status: 'complete' },
];

const variants = [
  { id: 'outline', label: 'Outline' },
  { id: 'soft', label: 'Soft' },
  { id: 'transparent', label: 'Transparent' },
] as const;

export default function FileListVariants() {
  return (
    <div className="@container w-full">
      <div className="mx-auto grid max-w-md gap-6 @3xl:max-w-none @3xl:grid-cols-3">
        {variants.map((variant) => (
          <div key={variant.id} className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium text-on-surface-variant">{variant.label}</span>
            <FileList aria-label={variant.label} variant={variant.id} items={items} />
          </div>
        ))}
      </div>
    </div>
  );
}
