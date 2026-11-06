import { Spinner } from '@/registry/ds/ui/spinner';

export default function SpinnerDemo() {
  return (
    <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant">
      <Spinner className="text-primary" />
      Syncing 3 bank accounts
    </p>
  );
}
