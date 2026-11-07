'use client';

import { useEffect, useState } from 'react';
import { CallIcon, type IconProps } from '@/registry/ds/lib/icons';
import { Avatar } from '@/registry/ds/ui/avatar';
import { Button } from '@/registry/ds/ui/button';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton, IconToggleButton } from '@/registry/ds/ui/icon-button';

const caller = 'Mara Lind';

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

const callEndPath =
  'M480-640q126 0 241 50.5T918-443q8 10 8.5 22t-8.5 21l-94 94q-8 8-23 9t-24-6l-114-85q-6-5-9-11t-3-13v-139q-42-16-85.5-22.5T480-580q-42 0-85.5 6.5T309-551v139q0 7-3 13t-9 11l-114 85q-12 9-24.5 8T136-306l-94-94q-9-9-8.5-21t8.5-22q82-96 197-146.5T480-640Z';
const micPath =
  'M408-453.92q-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423t-72-30.92ZM480-651Zm-30 501v-106q-96-11-166.5-77.5T202-498q-2-12.85 6.59-21.93 8.6-9.07 21.5-9.07 12.91 0 21.41 9t10.5 22q12 81 74.71 132.5Q399.42-314 479.65-314q81.35 0 143.85-51.5T698-498q2-13 10.68-22 8.67-9 21.5-9 12.82 0 21.32 9.07 8.5 9.08 6.5 21.93-11 97-81 164t-167 78v106q0 12.75-8.68 21.37-8.67 8.63-21.5 8.63-12.82 0-21.32-8.63-8.5-8.62-8.5-21.37Zm59.5-346.5Q521-510 521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483q18 0 29.5-13.5Z';
const micOffPath =
  'M658-381q-10-8-11-20t7-22q10.89-16.84 17.89-35.97T682-498q2-13 10.68-22 8.67-9 21.5-9 12.82 0 21.32 9.07 8.5 9.08 6.5 21.93-4 30.21-14 59.1-10 28.9-28 53.9-8 10-19.94 11-11.93 1-22.06-7ZM461-586Zm2.94-294q42.06 0 71.56 29.46T565-779v226q0 15-9.32 22.5t-20.5 7.5q-11.18 0-20.68-7.94T505-554v-225q0-17.42-12-29.21T464-820q-17 0-29 11.79T423-779v83q0 15-9.32 22.5t-20.5 7.5q-11.18 0-20.68-7.68-9.5-7.69-9.5-22.32v-83q0-42.08 29.44-71.54Q421.88-880 463.94-880ZM434-150v-106q-96-11-166.5-77.5T186-498q-2-12.85 6.59-21.93 8.6-9.07 21.5-9.07 12.91 0 21.35 8.91 8.45 8.92 10.56 22.09 12 81 75 132.5T464.15-314q37.85 0 72.96-12.34Q572.22-338.67 601-361l43 43q-31 26-69.01 41.57Q536.97-260.86 494-256v106q0 12.75-8.68 21.37-8.67 8.63-21.5 8.63-12.82 0-21.32-8.63-8.5-8.62-8.5-21.37Zm378 76L55-831q-8-8-8-19t8-19q8-8 19-8t19 8l757 757q8 8 8 19t-8 19q-8 8-19 8t-19-8Z';

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function DynamicIslandCall() {
  const [talked, setTalked] = useState(42);
  const [isMuted, setMuted] = useState(false);
  const [hasEnded, setEnded] = useState(false);
  const [isExpanded, setExpanded] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (hasEnded) return;
    const tick = setInterval(() => setTalked((seconds) => seconds + 1), 1000);
    return () => clearInterval(tick);
  }, [hasEnded]);

  function endCall() {
    setEnded(true);
    setExpanded(false);
    setAnnouncement(`Call with ${caller} ended`);
  }

  function callBack() {
    setTalked(0);
    setMuted(false);
    setEnded(false);
    setAnnouncement(`Calling ${caller}`);
  }

  return (
    <DynamicIsland
      title={hasEnded ? 'Call ended' : `Call with ${caller}`}
      activityKey={hasEnded ? 'ended' : 'call'}
      isExpanded={isExpanded}
      onExpandedChange={setExpanded}
      announcement={announcement}
    >
      <DynamicIslandCompact
        leading={
          hasEnded ? (
            <Glyph d={callEndPath} className="text-error" />
          ) : (
            <CallIcon className="text-success" />
          )
        }
        trailing={
          <span className={hasEnded ? 'text-error' : 'text-success'}>
            {hasEnded ? 'Ended' : duration(talked)}
          </span>
        }
      />
      <DynamicIslandExpanded>
        <div className="flex items-center gap-3">
          <Avatar name={caller} alt="" size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium">{caller}</p>
            <p className="text-on-surface-variant tabular-nums">
              {hasEnded ? `Call ended · ${duration(talked)}` : duration(talked)}
            </p>
          </div>
          {hasEnded ? (
            <Button size="sm" tone="neutral" onPress={callBack}>
              Call back
            </Button>
          ) : (
            <>
              <IconToggleButton
                size="lg"
                variant="soft"
                aria-label="Mute"
                isSelected={isMuted}
                onChange={setMuted}
                icon={<Glyph d={micPath} />}
                selectedIcon={<Glyph d={micOffPath} />}
              />
              <IconButton
                size="lg"
                variant="solid"
                tone="error"
                aria-label="End call"
                icon={<Glyph d={callEndPath} />}
                onPress={endCall}
              />
            </>
          )}
        </div>
      </DynamicIslandExpanded>
    </DynamicIsland>
  );
}
