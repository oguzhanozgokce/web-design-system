import { StatusTag, defaultStatusDefinitions, type StatusKey } from '@/registry/ds/ui/status-tag';

const keys = Object.keys(defaultStatusDefinitions) as StatusKey[];

export default function StatusTagBuiltIn() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
      {keys.map((key) => (
        <div key={key} className="flex min-w-0 flex-col items-start gap-1">
          <StatusTag status={key} />
          <code className="text-xs text-on-surface-variant">{key}</code>
        </div>
      ))}
    </div>
  );
}
