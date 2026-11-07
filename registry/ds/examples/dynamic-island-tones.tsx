'use client';

import { useEffect, useState } from 'react';
import type { IconProps } from '@/registry/ds/lib/icons';
import { ActivityBars } from '@/registry/ds/ui/activity-bars';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
  type DynamicIslandTone,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton } from '@/registry/ds/ui/icon-button';

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
const micPath =
  'M408-453.92q-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423t-72-30.92ZM450-150v-106q-96-11-166.5-77.5T202-498q-2-12.85 6.59-21.93 8.6-9.07 21.5-9.07 12.91 0 21.41 9t10.5 22q12 81 74.71 132.5Q399.42-314 479.65-314q81.35 0 143.85-51.5T698-498q2-13 10.68-22 8.67-9 21.5-9 12.82 0 21.32 9.07 8.5 9.08 6.5 21.93-11 97-81 164t-167 78v106q0 12.75-8.68 21.37-8.67 8.63-21.5 8.63-12.82 0-21.32-8.63-8.5-8.62-8.5-21.37Z';

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function VoiceMemo({ tone }: { tone: DynamicIslandTone }) {
  const [elapsed, setElapsed] = useState(12);
  const [isRecording, setRecording] = useState(true);

  useEffect(() => {
    if (!isRecording) return;
    const tick = setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => clearInterval(tick);
  }, [isRecording]);

  return (
    <DynamicIsland
      tone={tone}
      title="Voice memo"
      defaultExpanded={tone === 'light'}
      className="flex-1"
    >
      <DynamicIslandCompact
        leading={
          <span
            className={
              isRecording ? 'size-2.5 rounded-full bg-error' : 'size-2.5 rounded-full bg-outline'
            }
          />
        }
        trailing={
          <ActivityBars isActive={isRecording} size="sm" count={5} className="text-error" />
        }
      >
        <span className="text-on-surface-variant">{clock(elapsed)}</span>
      </DynamicIslandCompact>
      <DynamicIslandExpanded className="w-72">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-error-soft text-xl text-error">
            <Glyph d={micPath} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Voice memo</p>
            <p className="text-on-surface-variant tabular-nums">
              {isRecording ? clock(elapsed) : `Paused · ${clock(elapsed)}`}
            </p>
          </div>
          <ActivityBars isActive={isRecording} count={5} className="text-error" />
          <IconButton
            variant="soft"
            aria-label={isRecording ? 'Pause recording' : 'Resume recording'}
            icon={<Glyph d={isRecording ? pausePath : micPath} />}
            onPress={() => setRecording(!isRecording)}
          />
        </div>
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}

export default function DynamicIslandTones() {
  return (
    <div className="flex w-full flex-col items-center gap-8 md:flex-row md:items-start">
      <VoiceMemo tone="dark" />
      <VoiceMemo tone="light" />
    </div>
  );
}
