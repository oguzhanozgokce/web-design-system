'use client';

import { useState } from 'react';
import type { IconProps } from '@/registry/ds/lib/icons';
import { ActivityBars } from '@/registry/ds/ui/activity-bars';
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
const playPath =
  'M320-258v-450q0-14 9-22t21-8q4 0 8 1t8 3l354 226q7 5 10.5 11t3.5 14q0 8-3.5 14T720-458L366-232q-4 2-8 3t-8 1q-12 0-21-8t-9-22Z';

export default function ActivityBarsDemo() {
  const [isPlaying, setPlaying] = useState(true);

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-container border border-outline-subtle bg-surface-raised p-3">
      <span
        aria-hidden
        className="size-11 shrink-0 rounded-item bg-linear-to-br from-tertiary to-primary"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">Morning Light</p>
        <p className="truncate text-xs text-on-surface-variant">
          {isPlaying ? 'Harbor Lines' : 'Paused · Harbor Lines'}
        </p>
      </div>
      <ActivityBars isActive={isPlaying} className="text-primary" />
      <IconButton
        variant="soft"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        icon={<Glyph d={isPlaying ? pausePath : playPath} />}
        onPress={() => setPlaying(!isPlaying)}
      />
    </div>
  );
}
