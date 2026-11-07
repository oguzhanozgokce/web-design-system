import { ActivityBars } from '@/registry/ds/ui/activity-bars';

export default function ActivityBarsSizes() {
  return (
    <div className="flex items-end gap-10 text-on-surface">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <ActivityBars size={size} />
          <span className="text-xs text-on-surface-variant">{size}</span>
        </div>
      ))}
    </div>
  );
}
