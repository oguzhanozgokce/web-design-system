'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Skeleton } from '@/registry/ds/ui/skeleton';

export default function SkeletonLoaded() {
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    if (loaded) return;
    const timer = setTimeout(() => setLoaded(true), 1600);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <section
        aria-label="Latest message"
        aria-busy={!loaded}
        className="w-full rounded-container border border-outline-subtle bg-surface-raised p-4 text-on-surface"
      >
        <div className="flex items-center gap-3">
          <Skeleton isLoaded={loaded} shape="circle" className="w-fit">
            <span className="flex size-10 items-center justify-center rounded-full bg-neutral-soft text-sm font-medium text-on-surface">
              AM
            </span>
          </Skeleton>
          <div className="min-w-0 flex-1">
            <Skeleton isLoaded={loaded} shape="text" className="w-fit">
              <p className="text-sm font-semibold">Alex Morgan</p>
            </Skeleton>
            <Skeleton isLoaded={loaded} shape="text" className="mt-0.5 w-fit">
              <p className="text-xs text-on-surface-variant">Sent you 3 photos</p>
            </Skeleton>
          </div>
          <Skeleton isLoaded={loaded} shape="text" className="w-fit">
            <p className="text-xs text-on-surface-variant tabular-digits">09:41</p>
          </Skeleton>
        </div>
      </section>
      <Button variant="soft" size="sm" onPress={() => setLoaded(false)} isDisabled={!loaded}>
        Reload message
      </Button>
    </div>
  );
}
