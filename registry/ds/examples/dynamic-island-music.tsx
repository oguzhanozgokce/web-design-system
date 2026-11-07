'use client';

import { useEffect, useState } from 'react';
import type { IconProps } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { ActivityBars } from '@/registry/ds/ui/activity-bars';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { LinearProgress } from '@/registry/ds/ui/progress';

const tracks = [
  {
    title: 'Morning Light',
    artist: 'Harbor Lines',
    length: 214,
    art: 'from-tertiary to-primary',
  },
  { title: 'Paper Planes', artist: 'Juniper Coast', length: 178, art: 'from-info to-success' },
  { title: 'Night Bus', artist: 'Sora Field', length: 245, art: 'from-warning to-error' },
];

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

const previousPath =
  'M220-270v-420q0-13 8.5-21.5T250-720q13 0 21.5 8.5T280-690v420q0 13-8.5 21.5T250-240q-13 0-21.5-8.5T220-270Zm473-3L430-455q-7-5-10-11.5t-3-13.5q0-7 3-13.5t10-11.5l263-182q4-3 8-4.5t9-1.5q12 0 21 8t9 22v366q0 14-9 22t-21 8q-5 0-9-1.5t-8-4.5Z';
const nextPath =
  'M680-270v-420q0-13 8.5-21.5T710-720q13 0 21.5 8.5T740-690v420q0 13-8.5 21.5T710-240q-13 0-21.5-8.5T680-270Zm-460-27v-366q0-14 9-22t21-8q5 0 9 1.5t8 4.5l263 182q7 5 10 11.5t3 13.5q0 7-3 13.5T530-455L267-273q-4 3-8 4.5t-9 1.5q-12 0-21-8t-9-22Z';
const pausePath =
  'M615-200q-24.75 0-42.37-17.63Q555-235.25 555-260v-440q0-24.75 17.63-42.38Q590.25-760 615-760h55q24.75 0 42.38 17.62Q730-724.75 730-700v440q0 24.75-17.62 42.37Q694.75-200 670-200h-55Zm-325 0q-24.75 0-42.37-17.63Q230-235.25 230-260v-440q0-24.75 17.63-42.38Q265.25-760 290-760h55q24.75 0 42.38 17.62Q405-724.75 405-700v440q0 24.75-17.62 42.37Q369.75-200 345-200h-55Z';
const playPath =
  'M320-258v-450q0-14 9-22t21-8q4 0 8 1t8 3l354 226q7 5 10.5 11t3.5 14q0 8-3.5 14T720-458L366-232q-4 2-8 3t-8 1q-12 0-21-8t-9-22Z';

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function Art({ gradient, className }: { gradient: string; className?: string }) {
  return <span aria-hidden className={cn('shrink-0 bg-linear-to-br', gradient, className)} />;
}

export default function DynamicIslandMusic() {
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(71);
  const [isPlaying, setPlaying] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const track = tracks[index];

  function play(next: number) {
    const target = (next + tracks.length) % tracks.length;
    setIndex(target);
    setPosition(0);
    setAnnouncement(`Now playing ${tracks[target].title} by ${tracks[target].artist}`);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const tick = setTimeout(() => {
      if (position + 1 < track.length) {
        setPosition(position + 1);
        return;
      }
      const target = (index + 1) % tracks.length;
      setIndex(target);
      setPosition(0);
      setAnnouncement(`Now playing ${tracks[target].title} by ${tracks[target].artist}`);
    }, 1000);
    return () => clearTimeout(tick);
  }, [isPlaying, position, index, track.length]);

  return (
    <div className="flex h-48 w-full items-center justify-center">
      <DynamicIsland
        title={`${track.title}, ${track.artist}`}
        activityKey={index}
        defaultExpanded
        announcement={announcement}
      >
        <DynamicIslandCompact
          leading={<Art gradient={track.art} className="size-6 rounded-md" />}
          trailing={<ActivityBars isActive={isPlaying} className="text-tertiary" />}
        />
        <DynamicIslandExpanded className="gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <Art gradient={track.art} className="size-12 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium">{track.title}</p>
              <p className="truncate text-on-surface-variant">{track.artist}</p>
            </div>
            <ActivityBars isActive={isPlaying} size="lg" className="text-tertiary" />
          </div>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant tabular-nums">
            <span className="w-9">{clock(position)}</span>
            <LinearProgress
              aria-label="Playback position"
              value={position}
              maxValue={track.length}
              valueLabel={`${clock(position)} of ${clock(track.length)}`}
              size="sm"
              tone="neutral"
              className="flex-1"
            />
            <span className="w-9 text-end">−{clock(track.length - position)}</span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <IconButton
              aria-label="Previous track"
              icon={<Glyph d={previousPath} />}
              onPress={() => play(index - 1)}
            />
            <IconButton
              size="lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              icon={<Glyph d={isPlaying ? pausePath : playPath} />}
              onPress={() => setPlaying(!isPlaying)}
              className="[--icon-size:2rem]"
            />
            <IconButton
              aria-label="Next track"
              icon={<Glyph d={nextPath} />}
              onPress={() => play(index + 1)}
            />
          </div>
        </DynamicIslandExpanded>
      </DynamicIsland>
    </div>
  );
}
