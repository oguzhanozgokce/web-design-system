import { Spinner } from '@/registry/ds/ui/spinner';

export default function SpinnerSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-primary">
      <Spinner className="text-base" />
      <Spinner className="text-2xl" />
      <Spinner className="text-4xl" />
      <Spinner size={56} />
    </div>
  );
}
