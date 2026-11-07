'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

export default function RollingNumberDemo() {
  const [downloads, setDownloads] = useState(1289);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-on-surface-variant">Downloads this week</span>
        <RollingNumber
          value={downloads}
          className="text-5xl font-semibold tracking-tight text-on-surface"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="soft"
          size="sm"
          onPress={() => setDownloads((current) => Math.max(0, current - 1))}
        >
          −1
        </Button>
        <Button variant="soft" size="sm" onPress={() => setDownloads((current) => current + 1)}>
          +1
        </Button>
        <Button variant="soft" size="sm" onPress={() => setDownloads((current) => current + 11)}>
          +11
        </Button>
        <Button variant="soft" size="sm" onPress={() => setDownloads((current) => current + 250)}>
          +250
        </Button>
      </div>
    </div>
  );
}
