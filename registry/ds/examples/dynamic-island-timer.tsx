'use client';

import { useEffect, useState } from 'react';
import type { IconProps } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

const length = 30;
const twoDigits: Intl.NumberFormatOptions = { minimumIntegerDigits: 2 };

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

const timerPath =
  'M390-860q-13 0-21.5-8.5T360-890q0-13 8.5-21.5T390-920h180q13 0 21.5 8.5T600-890q0 13-8.5 21.5T570-860H390Zm111.5 438.5Q510-430 510-443v-170q0-13-8.5-21.5T480-643q-13 0-21.5 8.5T450-613v170q0 13 8.5 21.5T480-413q13 0 21.5-8.5Zm-161 312Q275-138 226-187t-77.5-114.5Q120-367 120-441t28.5-139.5Q177-646 226-695t114.5-77.5Q406-801 480-801q67 0 126 22.5T711-716l30-30q9-9 21-9t21 9q9 9 9 21t-9 21l-30 30q36 40 61.5 97T840-441q0 74-28.5 139.5T734-187q-49 49-114.5 77.5T480-81q-74 0-139.5-28.5Zm352-119Q780-316 780-441t-87.5-212.5Q605-741 480-741t-212.5 87.5Q180-566 180-441t87.5 212.5Q355-141 480-141t212.5-87.5ZM480-440Z';
const pausePath =
  'M615-200q-24.75 0-42.37-17.63Q555-235.25 555-260v-440q0-24.75 17.63-42.38Q590.25-760 615-760h55q24.75 0 42.38 17.62Q730-724.75 730-700v440q0 24.75-17.62 42.37Q694.75-200 670-200h-55Zm-325 0q-24.75 0-42.37-17.63Q230-235.25 230-260v-440q0-24.75 17.63-42.38Q265.25-760 290-760h55q24.75 0 42.38 17.62Q405-724.75 405-700v440q0 24.75-17.62 42.37Q369.75-200 345-200h-55Z';
const playPath =
  'M320-258v-450q0-14 9-22t21-8q4 0 8 1t8 3l354 226q7 5 10.5 11t3.5 14q0 8-3.5 14T720-458L366-232q-4 2-8 3t-8 1q-12 0-21-8t-9-22Z';

function Clock({ seconds, className }: { seconds: number; className?: string }) {
  return (
    <span className={cn('inline-flex tabular-nums', className)}>
      <RollingNumber value={Math.floor(seconds / 60)} />
      <span>:</span>
      <RollingNumber value={seconds % 60} formatOptions={twoDigits} />
    </span>
  );
}

const amberButton =
  'bg-warning-soft text-on-warning-soft data-[hovered]:bg-warning-soft-hover data-[pressed]:bg-warning-soft-hover';

export default function DynamicIslandTimer() {
  const [left, setLeft] = useState(length);
  const [isRunning, setRunning] = useState(true);
  const [isExpanded, setExpanded] = useState(false);
  const isDone = left === 0;

  useEffect(() => {
    if (!isRunning || left === 0) return;
    const tick = setTimeout(() => {
      setLeft(left - 1);
      if (left === 1) setExpanded(true);
    }, 1000);
    return () => clearTimeout(tick);
  }, [isRunning, left]);

  function restart() {
    setLeft(length);
    setRunning(true);
    setExpanded(false);
  }

  return (
    <DynamicIsland
      title="Timer"
      activityKey={isDone ? 'done' : 'running'}
      isExpanded={isExpanded}
      onExpandedChange={setExpanded}
      announcement={isDone ? 'Timer done' : undefined}
    >
      <DynamicIslandCompact
        leading={<Glyph d={timerPath} className="text-warning" />}
        trailing={
          isDone ? (
            <span className="text-warning">Done</span>
          ) : (
            <Clock seconds={left} className="text-warning" />
          )
        }
      />
      <DynamicIslandExpanded>
        {isDone ? (
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning-soft text-2xl text-warning">
              <Glyph d={timerPath} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium">Timer done</p>
              <p className="text-on-surface-variant">Your 30 seconds are up</p>
            </div>
            <Button size="sm" tone="neutral" onPress={restart}>
              Restart
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <IconButton
              size="lg"
              variant="soft"
              aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
              icon={<Glyph d={isRunning ? pausePath : playPath} />}
              onPress={() => setRunning(!isRunning)}
              className={amberButton}
            />
            <span className="ms-auto flex items-baseline gap-2">
              <span className="text-on-surface-variant">{isRunning ? 'Timer' : 'Paused'}</span>
              <Clock seconds={left} className="text-4xl font-medium tracking-tight text-warning" />
            </span>
          </div>
        )}
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}
