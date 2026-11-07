import { Spinner } from '@/registry/ds/ui/spinner';

export default function SpinnerDemo() {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-on-surface-variant">
      <Spinner size="sm" tone="primary" />
      Syncing 3 folders
    </p>
  );
}
