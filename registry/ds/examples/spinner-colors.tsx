import { Spinner } from '@/registry/ds/ui/spinner';

export default function SpinnerColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-label-lg text-on-primary">
        <Spinner />
        Publishing
      </span>
      <span className="flex items-center gap-2 rounded-full bg-secondary-container px-4 py-2 text-label-lg text-on-secondary-container">
        <Spinner />
        Saving draft
      </span>
      <span className="flex items-center gap-2 rounded-full bg-error-container px-4 py-2 text-label-lg text-on-error-container">
        <Spinner />
        Revoking keys
      </span>
    </div>
  );
}
