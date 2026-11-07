'use client';

import { useEffect, useId, useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

export default function RollingNumberProgress() {
  const id = useId();
  const [progress, setProgress] = useState(0);
  const [isStarted, setStarted] = useState(false);
  const isRunning = isStarted && progress < 1;

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setProgress((current) => Math.min(1, current + 0.02 + Math.random() * 0.09));
    }, 450);
    return () => clearInterval(timer);
  }, [isRunning]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span id={id} className="font-medium text-on-surface">
            Uploading 24 photos
          </span>
          <RollingNumber
            aria-hidden="true"
            value={progress}
            formatOptions={{ style: 'percent' }}
            className="text-on-surface-variant"
          />
        </div>
        <LinearProgress aria-labelledby={id} value={progress * 100} />
      </div>
      <Button
        variant="soft"
        size="sm"
        className="self-start"
        isDisabled={isRunning}
        onPress={() => {
          setProgress(0);
          setStarted(true);
        }}
      >
        {progress === 1 ? 'Upload again' : 'Start upload'}
      </Button>
    </div>
  );
}
