'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Key } from 'react-aria-components';
import { CallIcon, UploadIcon, type IconProps } from '@/registry/ds/lib/icons';
import { ActivityBars } from '@/registry/ds/ui/activity-bars';
import { Avatar } from '@/registry/ds/ui/avatar';
import {
  DynamicIsland,
  DynamicIslandCompact,
  DynamicIslandExpanded,
} from '@/registry/ds/ui/dynamic-island';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

type Activity = 'timer' | 'call' | 'music' | 'upload';

const activities: { id: Activity; label: string }[] = [
  { id: 'timer', label: 'Timer' },
  { id: 'call', label: 'Call' },
  { id: 'music', label: 'Music' },
  { id: 'upload', label: 'Upload' },
];

const titles: Record<Activity, string> = {
  timer: 'Timer',
  call: 'Call with Mara Lind',
  music: 'Morning Light, Harbor Lines',
  upload: 'Upload of trip-photos.zip',
};

const expandedSpacing: Record<Activity, string | undefined> = {
  timer: undefined,
  call: undefined,
  music: 'gap-4 px-5 py-4',
  upload: 'px-5 pb-4',
};

const twoDigits: Intl.NumberFormatOptions = { minimumIntegerDigits: 2 };
const percent: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };

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
const previousPath =
  'M220-270v-420q0-13 8.5-21.5T250-720q13 0 21.5 8.5T280-690v420q0 13-8.5 21.5T250-240q-13 0-21.5-8.5T220-270Zm473-3L430-455q-7-5-10-11.5t-3-13.5q0-7 3-13.5t10-11.5l263-182q4-3 8-4.5t9-1.5q12 0 21 8t9 22v366q0 14-9 22t-21 8q-5 0-9-1.5t-8-4.5Z';
const nextPath =
  'M680-270v-420q0-13 8.5-21.5T710-720q13 0 21.5 8.5T740-690v420q0 13-8.5 21.5T710-240q-13 0-21.5-8.5T680-270Zm-460-27v-366q0-14 9-22t21-8q5 0 9 1.5t8 4.5l263 182q7 5 10 11.5t3 13.5q0 7-3 13.5T530-455L267-273q-4 3-8 4.5t-9 1.5q-12 0-21-8t-9-22Z';
const callEndPath =
  'M480-640q126 0 241 50.5T918-443q8 10 8.5 22t-8.5 21l-94 94q-8 8-23 9t-24-6l-114-85q-6-5-9-11t-3-13v-139q-42-16-85.5-22.5T480-580q-42 0-85.5 6.5T309-551v139q0 7-3 13t-9 11l-114 85q-12 9-24.5 8T136-306l-94-94q-9-9-8.5-21t8.5-22q82-96 197-146.5T480-640Z';

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function Countdown({ seconds, className }: { seconds: number; className?: string }) {
  return (
    <span className={className}>
      <span className="inline-flex tabular-nums">
        <RollingNumber value={Math.floor(seconds / 60)} />
        <span>:</span>
        <RollingNumber value={seconds % 60} formatOptions={twoDigits} />
      </span>
    </span>
  );
}

const amberButton =
  'bg-warning-soft text-on-warning-soft data-[hovered]:bg-warning-soft-hover data-[pressed]:bg-warning-soft-hover';

export default function DynamicIslandDemo() {
  const [activity, setActivity] = useState<Activity>('music');
  const [isExpanded, setExpanded] = useState(true);
  const [timer, setTimer] = useState(299);
  const [isTimerRunning, setTimerRunning] = useState(true);
  const [talked, setTalked] = useState(42);
  const [hasCallEnded, setCallEnded] = useState(false);
  const [position, setPosition] = useState(71);
  const [isPlaying, setPlaying] = useState(true);
  const [sent, setSent] = useState(0.24);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const tick = setInterval(() => {
      if (isTimerRunning) setTimer((seconds) => (seconds <= 0 ? 299 : seconds - 1));
      if (!hasCallEnded) setTalked((seconds) => seconds + 1);
      if (isPlaying) setPosition((seconds) => (seconds >= 214 ? 0 : seconds + 1));
      setSent((share) => (share >= 1 ? 0 : Math.min(1, share + 0.04)));
    }, 1000);
    return () => clearInterval(tick);
  }, [isTimerRunning, hasCallEnded, isPlaying]);

  function choose(key: Key | null) {
    if (key == null) return;
    setActivity(key as Activity);
    setCallEnded(false);
    setAnnouncement('');
  }

  function endCall() {
    setCallEnded(true);
    setExpanded(false);
    setAnnouncement('Call with Mara Lind ended');
  }

  const compact: Record<Activity, { leading: ReactNode; trailing: ReactNode }> = {
    timer: {
      leading: <Glyph d={timerPath} className="text-warning" />,
      trailing: <Countdown seconds={timer} className="text-warning" />,
    },
    call: {
      leading: hasCallEnded ? (
        <Glyph d={callEndPath} className="text-error" />
      ) : (
        <CallIcon className="text-success" />
      ),
      trailing: (
        <span className={hasCallEnded ? 'text-error' : 'text-success'}>
          {hasCallEnded ? 'Ended' : clock(talked)}
        </span>
      ),
    },
    music: {
      leading: <span className="size-6 rounded-md bg-linear-to-br from-tertiary to-primary" />,
      trailing: <ActivityBars isActive={isPlaying} className="text-tertiary" />,
    },
    upload: {
      leading: <UploadIcon className="text-primary" />,
      trailing: <RollingNumber value={sent} formatOptions={percent} className="text-primary" />,
    },
  };

  const expanded: Record<Activity, ReactNode> = {
    timer: (
      <div className="flex items-center gap-3">
        <IconButton
          size="lg"
          variant="soft"
          aria-label={isTimerRunning ? 'Pause timer' : 'Resume timer'}
          icon={<Glyph d={isTimerRunning ? pausePath : playPath} />}
          onPress={() => setTimerRunning(!isTimerRunning)}
          className={amberButton}
        />
        <span className="ms-auto flex items-baseline gap-2">
          <span className="text-on-surface-variant">Timer</span>
          <Countdown seconds={timer} className="text-4xl font-medium tracking-tight text-warning" />
        </span>
      </div>
    ),
    call: (
      <div className="flex items-center gap-3">
        <Avatar name="Mara Lind" alt="" size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium">Mara Lind</p>
          <p className="text-on-surface-variant tabular-nums">
            {hasCallEnded ? 'Call ended' : clock(talked)}
          </p>
        </div>
        {hasCallEnded ? null : (
          <IconButton
            size="lg"
            variant="solid"
            tone="error"
            aria-label="End call"
            icon={<Glyph d={callEndPath} />}
            onPress={endCall}
          />
        )}
      </div>
    ),
    music: (
      <>
        <div className="flex items-center gap-3">
          <span className="size-12 shrink-0 rounded-xl bg-linear-to-br from-tertiary to-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium">Morning Light</p>
            <p className="truncate text-on-surface-variant">Harbor Lines</p>
          </div>
          <ActivityBars isActive={isPlaying} size="lg" className="text-tertiary" />
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant tabular-nums">
          <span className="w-9">{clock(position)}</span>
          <LinearProgress
            aria-label="Playback position"
            value={position}
            maxValue={214}
            valueLabel={`${clock(position)} of 3:34`}
            size="sm"
            tone="neutral"
            className="flex-1"
          />
          <span className="w-9 text-end">−{clock(214 - position)}</span>
        </div>
        <div className="flex items-center justify-center gap-6">
          <IconButton
            aria-label="Restart track"
            icon={<Glyph d={previousPath} />}
            onPress={() => setPosition(0)}
          />
          <IconButton
            size="lg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            icon={<Glyph d={isPlaying ? pausePath : playPath} />}
            onPress={() => setPlaying(!isPlaying)}
            className="[--icon-size:2rem]"
          />
          <IconButton
            aria-label="Skip ahead"
            icon={<Glyph d={nextPath} />}
            onPress={() => setPosition(Math.min(213, position + 30))}
          />
        </div>
      </>
    ),
    upload: (
      <>
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-item bg-primary-soft text-xl text-primary">
            <UploadIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">trip-photos.zip</p>
            <p className="text-xs text-on-surface-variant tabular-nums">
              2.4 GB · <RollingNumber value={sent} formatOptions={percent} />
            </p>
          </div>
        </div>
        <LinearProgress aria-label="Uploading trip-photos.zip" value={sent * 100} size="sm" />
      </>
    ),
  };

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex h-48 w-full items-center justify-center">
        <DynamicIsland
          title={titles[activity]}
          activityKey={`${activity}:${hasCallEnded}`}
          isExpanded={isExpanded}
          onExpandedChange={setExpanded}
          announcement={announcement}
        >
          <DynamicIslandCompact {...compact[activity]} />
          <DynamicIslandExpanded className={expandedSpacing[activity]}>
            {expanded[activity]}
          </DynamicIslandExpanded>
        </DynamicIsland>
      </div>
      <SegmentedControl
        aria-label="Activity"
        size="sm"
        selectedKeys={[activity]}
        onSelectionChange={(keys) => choose([...keys][0] ?? null)}
      >
        {activities.map((item) => (
          <SegmentedControlItem key={item.id} id={item.id}>
            {item.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}
