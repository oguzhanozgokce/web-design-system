import { ActivityBars } from '@/registry/ds/ui/activity-bars';

export default function ActivityBarsCount() {
  return (
    <div className="flex items-end gap-10 text-primary">
      {([3, 4, 5] as const).map((count) => (
        <div key={count} className="flex flex-col items-center gap-3">
          <ActivityBars count={count} size="lg" />
          <span className="text-xs text-on-surface-variant">{count} bars</span>
        </div>
      ))}
    </div>
  );
}
