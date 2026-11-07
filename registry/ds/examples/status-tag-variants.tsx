import { StatusTag } from '@/registry/ds/ui/status-tag';

const statuses = ['live', 'pending', 'failed', 'archived'] as const;

export default function StatusTagVariants() {
  return (
    <div className="flex flex-col items-center gap-3">
      {(['soft', 'outline', 'solid'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center justify-center gap-2">
          {statuses.map((status) => (
            <StatusTag key={status} status={status} variant={variant} />
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {statuses.map((status) => (
          <StatusTag key={status} status={status} size="sm" />
        ))}
      </div>
    </div>
  );
}
