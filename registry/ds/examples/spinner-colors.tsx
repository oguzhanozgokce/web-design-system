import { Spinner } from '@/registry/ds/ui/spinner';

export default function SpinnerColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="flex h-10 items-center gap-2 rounded-control bg-primary-solid px-4 text-sm font-medium text-on-primary-solid">
        <Spinner />
        Publishing
      </span>
      <span className="flex h-10 items-center gap-2 rounded-control bg-neutral-soft px-4 text-sm font-medium text-on-surface">
        <Spinner />
        Saving draft
      </span>
      <span className="flex h-10 items-center gap-2 rounded-control bg-error-soft px-4 text-sm font-medium text-on-error-soft">
        <Spinner />
        Deleting files
      </span>
    </div>
  );
}
