import { Skeleton } from '@/registry/ds/ui/skeleton';

export default function SkeletonText() {
  return (
    <article aria-busy="true" aria-label="Release notes" className="w-full max-w-md">
      <Skeleton shape="text" className="w-1/2 text-headline-sm" />
      <Skeleton shape="text" className="mt-1 w-1/4 text-label-md" />
      <Skeleton shape="text" lines={4} className="mt-4 text-body-md" />
    </article>
  );
}
