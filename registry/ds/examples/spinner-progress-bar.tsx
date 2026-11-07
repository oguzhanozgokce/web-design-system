import { ProgressBar } from 'react-aria-components';
import { Spinner } from '@/registry/ds/ui/spinner';

export default function SpinnerProgressBar() {
  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-container border border-outline-subtle bg-surface-raised p-4 text-on-surface">
      <ProgressBar isIndeterminate aria-label="Loading recent messages">
        <Spinner size="md" tone="primary" />
      </ProgressBar>
      <div>
        <p className="text-sm font-semibold">Recent messages</p>
        <p className="text-xs text-on-surface-variant">Fetching the last 30 days</p>
      </div>
    </div>
  );
}
