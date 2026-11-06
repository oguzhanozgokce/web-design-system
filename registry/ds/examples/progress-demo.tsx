'use client';

import { useEffect, useState } from 'react';
import { LinearProgress } from '@/registry/ds/ui/progress';

export default function ProgressDemo() {
  const [uploaded, setUploaded] = useState(18);

  useEffect(() => {
    const timer = setInterval(
      () => setUploaded((value) => (value >= 100 ? 0 : Math.min(100, value + 7))),
      700,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <LinearProgress
      label="Uploading statements-2026-q3.csv"
      value={uploaded}
      showValueLabel
      className="max-w-md"
    />
  );
}
