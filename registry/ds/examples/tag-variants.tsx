import { Tag, type TagTone } from '@/registry/ds/ui/tag';

const statuses: { tone: TagTone; label: string }[] = [
  { tone: 'neutral', label: 'Archived' },
  { tone: 'success', label: 'Active' },
  { tone: 'warning', label: 'Pending' },
  { tone: 'error', label: 'Failed' },
];

export default function TagVariants() {
  return (
    <div className="flex flex-col items-center gap-3">
      {(['soft', 'outline', 'solid'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center justify-center gap-2">
          {statuses.map((status) => (
            <Tag key={status.tone} variant={variant} tone={status.tone} dot>
              {status.label}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
}
