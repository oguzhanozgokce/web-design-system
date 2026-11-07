'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, DownloadIcon, type IconProps } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { CircularProgress, LinearProgress } from '@/registry/ds/ui/progress';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

type DownloadState = 'downloading' | 'paused' | 'done';

const title = 'Lisbon offline map';
const total = 640;
const percent: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };
const megabytes = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'megabyte',
  maximumFractionDigits: 0,
});

function Glyph({ d, ...props }: IconProps & { d: string }) {
  return (
    <svg
      viewBox="0 -960 960 960"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
      focusable={false}
      {...props}
    >
      <path d={d} />
    </svg>
  );
}

const pausePath =
  'M615-200q-24.75 0-42.37-17.63Q555-235.25 555-260v-440q0-24.75 17.63-42.38Q590.25-760 615-760h55q24.75 0 42.38 17.62Q730-724.75 730-700v440q0 24.75-17.62 42.37Q694.75-200 670-200h-55Zm-325 0q-24.75 0-42.37-17.63Q230-235.25 230-260v-440q0-24.75 17.63-42.38Q265.25-760 290-760h55q24.75 0 42.38 17.62Q405-724.75 405-700v440q0 24.75-17.62 42.37Q369.75-200 345-200h-55Z';
const playPath =
  'M320-258v-450q0-14 9-22t21-8q4 0 8 1t8 3l354 226q7 5 10.5 11t3.5 14q0 8-3.5 14T720-458L366-232q-4 2-8 3t-8 1q-12 0-21-8t-9-22Z';

export default function DynamicIslandDownload() {
  const [state, setState] = useState<DownloadState>('downloading');
  const [received, setReceived] = useState(0.32);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (state !== 'downloading') return;
    const tick = setTimeout(() => {
      const next = Math.min(1, received + 0.012 + ((received * 53) % 1) * 0.02);
      setReceived(next);
      if (next === 1) {
        setState('done');
        setAnnouncement(`${title} saved`);
      }
    }, 400);
    return () => clearTimeout(tick);
  }, [state, received]);

  function restart() {
    setReceived(0);
    setState('downloading');
    setAnnouncement(`Downloading ${title}`);
  }

  const isDone = state === 'done';
  const isPaused = state === 'paused';

  return (
    <DynamicIsland
      title={`Download of ${title}`}
      activityKey={isDone ? 'done' : 'downloading'}
      defaultExpanded
      announcement={announcement}
    >
      <DynamicIslandCompact
        leading={
          isDone ? (
            <CheckCircleIcon className="text-success" />
          ) : (
            <CircularProgress
              aria-label={`Downloading ${title}`}
              value={received * 100}
              size="sm"
              tone="neutral"
            />
          )
        }
        trailing={
          isDone ? (
            <span className="text-success">Saved</span>
          ) : (
            <RollingNumber
              value={received}
              formatOptions={percent}
              className={isPaused ? 'text-on-surface-variant' : 'text-info'}
            />
          )
        }
      />
      <DynamicIslandExpanded className="px-5 pb-4">
        <div className="flex items-center gap-3">
          <span
            className={
              isDone
                ? 'flex size-10 shrink-0 items-center justify-center rounded-item bg-success-soft text-xl text-success'
                : 'flex size-10 shrink-0 items-center justify-center rounded-item bg-info-soft text-xl text-info'
            }
          >
            {isDone ? <CheckCircleIcon /> : <DownloadIcon />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{title}</p>
            <p className="text-xs text-on-surface-variant tabular-nums">
              {isDone ? (
                `Saved · ${megabytes.format(total)}`
              ) : (
                <>
                  {megabytes.format(received * total)} of {megabytes.format(total)} ·{' '}
                  {isPaused ? 'Paused' : <RollingNumber value={received} formatOptions={percent} />}
                </>
              )}
            </p>
          </div>
          {isDone ? (
            <Button size="sm" tone="neutral" onPress={restart}>
              Download again
            </Button>
          ) : (
            <IconButton
              variant="soft"
              aria-label={isPaused ? 'Resume download' : 'Pause download'}
              icon={<Glyph d={isPaused ? playPath : pausePath} />}
              onPress={() => setState(isPaused ? 'downloading' : 'paused')}
            />
          )}
        </div>
        {isDone ? null : (
          <LinearProgress
            aria-label={`Downloading ${title}`}
            value={received * 100}
            size="sm"
            tone="info"
          />
        )}
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}
