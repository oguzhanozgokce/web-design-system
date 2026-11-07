import { Skeleton } from '@/registry/ds/ui/skeleton';

export default function SkeletonShapes() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 items-center gap-6 sm:grid-cols-3">
      <div className="flex flex-col items-center gap-2">
        <Skeleton shape="circle" className="size-16" />
        <p className="text-xs font-medium text-on-surface-variant">circle</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton shape="block" className="h-16" />
        <p className="text-xs font-medium text-on-surface-variant">block</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton shape="text" lines={3} className="text-xs" />
        <p className="text-xs font-medium text-on-surface-variant">text</p>
      </div>
    </div>
  );
}
