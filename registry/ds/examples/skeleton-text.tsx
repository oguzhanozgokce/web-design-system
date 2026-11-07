import { Skeleton } from '@/registry/ds/ui/skeleton';

export default function SkeletonText() {
  return (
    <article aria-busy="true" aria-label="Release notes" className="w-full max-w-md">
      <Skeleton shape="text" className="w-1/2 text-2xl" />
      <Skeleton shape="text" className="mt-1 w-1/4 text-xs" />
      <Skeleton shape="text" lines={4} className="mt-4 text-sm" />
    </article>
  );
}
