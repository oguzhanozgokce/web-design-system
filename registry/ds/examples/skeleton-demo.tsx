import { Skeleton } from '@/registry/ds/ui/skeleton';

export default function SkeletonDemo() {
  return (
    <section
      aria-label="Team members"
      aria-busy="true"
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface-container-low p-4"
    >
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-3">
          <Skeleton shape="circle" />
          <div className="flex-1">
            <Skeleton shape="text" className="w-2/5 text-title-sm" />
            <Skeleton shape="text" className="w-3/5 text-body-sm" />
          </div>
        </div>
      ))}
    </section>
  );
}
