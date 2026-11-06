import { CircularProgress, LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressIndeterminate() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <LinearProgress label="Syncing bank feed" isIndeterminate />
      <CircularProgress aria-label="Loading invoices" isIndeterminate />
    </div>
  );
}
