'use client';

import { useEffect, useState } from 'react';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

export default function RollingNumberLive() {
  const [visitors, setVisitors] = useState(128);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisitors((current) => Math.max(0, current + Math.round(Math.random() * 9) - 3));
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-container border border-outline-subtle bg-surface-raised px-4 py-3">
      <span aria-hidden="true" className="size-2 rounded-full bg-success-solid" />
      <span className="text-sm text-on-surface-variant">Visitors right now</span>
      <RollingNumber value={visitors} className="text-lg font-semibold text-on-surface" />
    </div>
  );
}
