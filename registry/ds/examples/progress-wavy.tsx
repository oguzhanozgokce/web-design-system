'use client';

import { useEffect, useState } from 'react';
import { LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressWavy() {
  const [exported, setExported] = useState(35);

  useEffect(() => {
    const timer = setInterval(
      () => setExported((value) => (value >= 100 ? 0 : Math.min(100, value + 5))),
      800,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <LinearProgress
        label="Exporting 2,400 orders"
        value={exported}
        variant="wavy"
        showValueLabel
      />
      <LinearProgress label="Generating annual report" variant="wavy" isIndeterminate />
      <LinearProgress
        label="Backing up workspace"
        value={58}
        variant="wavy"
        thickness={8}
        showValueLabel
      />
    </div>
  );
}
