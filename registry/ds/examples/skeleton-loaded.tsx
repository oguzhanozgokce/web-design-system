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
        aria-label="Invoice INV-2048"
        aria-busy={!loaded}
        className="w-full rounded-lg bg-surface-container-low p-4 text-on-surface"
      >
        <div className="flex items-center gap-3">
          <Skeleton isLoaded={loaded} shape="circle" className="w-fit rounded-full">
            <span className="flex size-10 items-center justify-center rounded-full bg-tertiary-container text-title-sm text-on-tertiary-container">
              AC
            </span>
          </Skeleton>
          <div className="min-w-0 flex-1">
            <Skeleton isLoaded={loaded} shape="text" className="w-fit">
              <p className="text-title-sm">Acme Corp</p>
            </Skeleton>
            <Skeleton isLoaded={loaded} shape="text" className="mt-0.5 w-fit">
              <p className="text-body-sm text-on-surface-variant">Due 14 November</p>
            </Skeleton>
          </div>
          <Skeleton isLoaded={loaded} shape="text" className="w-fit">
            <p className="text-title-md tabular-digits">€1,280.00</p>
          </Skeleton>
        </div>
      </section>
      <Button variant="tonal" size="sm" onPress={() => setLoaded(false)} isDisabled={!loaded}>
        Reload invoice
      </Button>
    </div>
  );
}
