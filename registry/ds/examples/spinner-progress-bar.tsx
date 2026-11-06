import { ProgressBar } from 'react-aria-components';
import { Spinner } from '@/registry/ds/ui/spinner';

export default function SpinnerProgressBar() {
  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-lg bg-surface-container-low p-4 text-on-surface">
      <ProgressBar
        isIndeterminate
        aria-label="Loading recent orders"
        className="text-2xl text-primary"
      >
        <Spinner />
      </ProgressBar>
      <div>
        <p className="text-title-sm">Recent orders</p>
        <p className="text-body-sm text-on-surface-variant">Fetching the last 30 days</p>
      </div>
    </div>
  );
}
