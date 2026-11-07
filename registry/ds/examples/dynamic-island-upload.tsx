'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, CloseIcon, UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

type UploadState = 'uploading' | 'done' | 'cancelled';

const file = 'trip-photos.zip';
const total = 2.4;
const percent: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
const gigabytes = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'gigabyte',
  maximumFractionDigits: 1,
});

export default function DynamicIslandUpload() {
  const [state, setState] = useState<UploadState>('uploading');
  const [sent, setSent] = useState(0.18);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (state !== 'uploading') return;
    const tick = setTimeout(() => {
      const next = Math.min(1, sent + 0.015 + ((sent * 37) % 1) * 0.03);
      setSent(next);
      if (next === 1) {
        setState('done');
        setAnnouncement(`${file} uploaded`);
      }
    }, 450);
    return () => clearTimeout(tick);
  }, [state, sent]);

  function cancel() {
    setState('cancelled');
    setAnnouncement('Upload cancelled');
  }

  function restart() {
    setSent(0);
    setState('uploading');
    setAnnouncement(`Uploading ${file}`);
  }

  return (
    <DynamicIsland title={`Upload of ${file}`} activityKey={state} announcement={announcement}>
      <DynamicIslandCompact
        leading={
          state === 'done' ? (
            <CheckCircleIcon className="text-success" />
          ) : state === 'cancelled' ? (
            <CloseIcon className="text-on-surface-variant" />
          ) : (
            <UploadIcon className="text-primary" />
          )
        }
        trailing={
          state === 'done' ? (
            <span className="text-success">Done</span>
          ) : state === 'cancelled' ? (
            <span className="text-on-surface-variant">Cancelled</span>
          ) : (
            <RollingNumber value={sent} formatOptions={percent} className="text-primary" />
          )
        }
      />
      <DynamicIslandExpanded className="px-5 pb-4">
        {state === 'uploading' ? (
          <>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-item bg-primary-soft text-xl text-primary">
                <UploadIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file}</p>
                <p className="text-xs text-on-surface-variant tabular-nums">
                  {gigabytes.format(sent * total)} of {gigabytes.format(total)} ·{' '}
                  <RollingNumber value={sent} formatOptions={percent} />
                </p>
              </div>
              <IconButton
                size="sm"
                variant="soft"
                aria-label="Cancel upload"
                icon={<CloseIcon />}
                onPress={cancel}
              />
            </div>
            <LinearProgress aria-label={`Uploading ${file}`} value={sent * 100} size="sm" />
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className={
                state === 'done'
                  ? 'flex size-10 shrink-0 items-center justify-center rounded-item bg-success-soft text-xl text-success'
                  : 'flex size-10 shrink-0 items-center justify-center rounded-item bg-neutral-soft text-xl text-on-surface-variant'
              }
            >
              {state === 'done' ? <CheckCircleIcon /> : <CloseIcon />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{file}</p>
              <p className="text-xs text-on-surface-variant">
                {state === 'done' ? `Uploaded · ${gigabytes.format(total)}` : 'Upload cancelled'}
              </p>
            </div>
            <Button size="sm" tone="neutral" onPress={restart}>
              {state === 'done' ? 'Upload again' : 'Retry'}
            </Button>
          </div>
        )}
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}
