'use client';

import { useInView } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowForwardIcon } from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import { CopyButton } from '@/registry/ds/ui/copy-button';
import { DSProvider, useMotionPreference } from '@/registry/ds/ui/ds-provider';
import { DynamicTheme } from '@/registry/ds/ui/dynamic-theme';
import { OrDivider } from '@/registry/ds/ui/divider';
import { Kbd } from '@/registry/ds/ui/kbd';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Switch } from '@/registry/ds/ui/switch';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';
import { Reveal } from '@/components/showcase/reveal';

const cycle = [
  { name: 'Indigo', seed: '#5b4bff' },
  { name: 'Teal', seed: '#0b8f6a' },
  { name: 'Coral', seed: '#e8613c' },
  { name: 'Amber', seed: '#c98a00' },
  { name: 'Rose', seed: '#c2185b' },
];

const roles = [
  { name: 'primary', className: 'bg-primary text-on-primary' },
  { name: 'secondary', className: 'bg-secondary text-on-secondary' },
  { name: 'tertiary', className: 'bg-tertiary text-on-tertiary' },
  { name: 'primary container', className: 'bg-primary-container text-on-primary-container' },
  {
    name: 'secondary container',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  { name: 'tertiary container', className: 'bg-tertiary-container text-on-tertiary-container' },
];

const surfaces = [
  'bg-surface-container-lowest',
  'bg-surface-container-low',
  'bg-surface-container',
  'bg-surface-container-high',
  'bg-surface-container-highest',
];

function Tile({
  title,
  body,
  children,
  className,
  delay = 0,
}: {
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal
      delay={delay}
      className={cn(
        'flex min-w-0 flex-col gap-5 overflow-clip rounded-xl border border-outline-variant bg-surface-container-low p-6',
        className,
      )}
    >
      <div className="flex min-h-40 flex-1 items-center justify-center">{children}</div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-title-lg text-on-surface">{title}</h3>
        <p className="text-body-md text-pretty text-on-surface-variant">{body}</p>
      </div>
    </Reveal>
  );
}

function PaletteCycle() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const { decorativeEnabled } = useMotionPreference();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const running = inView && decorativeEnabled && !paused;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % cycle.length), 2400);
    return () => clearInterval(timer);
  }, [running]);

  const current = cycle[index];

  return (
    <div
      ref={ref}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="w-full"
    >
      <DynamicTheme seed={current.seed} paletteStyle="vibrant" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-label-lg text-on-surface-variant">
            Seed <span className="font-mono text-on-surface">{current.seed}</span>
          </span>
          <span className="rounded-full bg-primary px-3 py-1 text-label-md text-on-primary transition-colors duration-500 ease-standard">
            {current.name}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {roles.map((role) => (
            <div
              key={role.name}
              className={cn(
                'flex h-16 items-end rounded-md p-2 text-label-md transition-colors duration-500 ease-standard',
                role.className,
              )}
            >
              {role.name}
            </div>
          ))}
        </div>
        <div className="flex overflow-hidden rounded-md border border-outline-variant">
          {surfaces.map((surface) => (
            <div
              key={surface}
              className={cn('h-8 flex-1 transition-colors duration-500 ease-standard', surface)}
            />
          ))}
        </div>
      </DynamicTheme>
    </div>
  );
}

function MotionDemo() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-2">
        <ToggleButton defaultSelected>Bold</ToggleButton>
        <ToggleButton>Italic</ToggleButton>
      </div>
      <Switch defaultSelected>Spring handle</Switch>
    </div>
  );
}

function A11yDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl aria-label="Report period" defaultSelectedKeys={['week']}>
        <SegmentedControlItem id="day">Day</SegmentedControlItem>
        <SegmentedControlItem id="week">Week</SegmentedControlItem>
        <SegmentedControlItem id="month">Month</SegmentedControlItem>
      </SegmentedControl>
      <p className="flex flex-wrap items-center justify-center gap-1.5 text-body-sm text-on-surface-variant">
        Try <Kbd size="sm">Tab</Kbd> and the <Kbd size="sm">←</Kbd>
        <Kbd size="sm">→</Kbd> keys
      </p>
    </div>
  );
}

function RtlDemo() {
  return (
    <div className="grid w-full gap-3">
      <div dir="ltr" className="flex items-center gap-3 rounded-md bg-surface-container p-3">
        <LinearProgress aria-label="Upload" value={62} className="flex-1" />
        <Button
          size="sm"
          variant="tonal"
          endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
        >
          Next
        </Button>
      </div>
      <DSProvider locale="ar-u-nu-latn">
        <div
          dir="rtl"
          lang="ar"
          className="flex items-center gap-3 rounded-md bg-surface-container p-3"
        >
          <LinearProgress aria-label="الرفع" value={62} className="flex-1" />
          <Button
            size="sm"
            variant="tonal"
            endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
          >
            التالي
          </Button>
        </div>
      </DSProvider>
    </div>
  );
}

function LabelsDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <pre className="overflow-x-auto rounded-md bg-inverse-surface p-3 text-body-sm text-inverse-on-surface">
        <code>{`<DSProvider labels={{
  divider: { or: 'o' },
}}>`}</code>
      </pre>
      <DSProvider labels={{ divider: { or: 'o' } }}>
        <div lang="es" className="flex flex-col gap-2">
          <Button variant="outlined" fullWidth>
            Continuar con una llave de acceso
          </Button>
          <OrDivider />
          <Button fullWidth>Continuar con correo</Button>
        </div>
      </DSProvider>
    </div>
  );
}

function InstallDemo({ files }: { files: string[] }) {
  const command = 'npx shadcn@latest add @ds/button';
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-3 rounded-lg bg-inverse-surface p-4 text-inverse-on-surface">
        <div className="flex items-center justify-between gap-3">
          <code className="min-w-0 truncate font-mono text-body-md">
            <span className="opacity-60">$ </span>
            {command}
          </code>
          <CopyButton
            value={command}
            aria-label="Copy install command"
            className="text-inverse-on-surface"
          />
        </div>
        <p className="text-body-sm opacity-80">
          Adds the component and everything it needs, nothing else:
        </p>
        <ul className="flex flex-col gap-1 font-mono text-body-sm">
          {files.map((file) => (
            <li key={file} className="truncate">
              <span className="text-inverse-primary">+ </span>
              {file}
            </li>
          ))}
        </ul>
      </div>
      <ol className="flex flex-col justify-center gap-4">
        {[
          ['Install', 'One command per component, through the shadcn CLI.'],
          ['Own it', 'The file lives in your project. Change a default where it is.'],
          ['Update', 'Diff against the registry and take upstream fixes when you choose.'],
        ].map(([title, body], index) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-container text-label-lg text-on-primary-container">
              {index + 1}
            </span>
            <div>
              <p className="text-title-sm text-on-surface">{title}</p>
              <p className="text-body-sm text-on-surface-variant">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Features({ installFiles }: { installFiles: string[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <Reveal className="flex max-w-3xl flex-col gap-3">
        <p className="text-label-lg tracking-[0.12em] text-primary uppercase">Why it holds up</p>
        <h2 className="text-headline-lg text-balance text-on-background sm:text-display-sm">
          Built like a product, not a template.
        </h2>
        <p className="text-body-lg text-pretty text-on-surface-variant">
          The same decisions as the Compose library on mobile, so a screen reads the same on a phone
          and in a browser.
        </p>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6">
        <Tile
          className="md:col-span-4"
          title="One seed, every role"
          body="Primary, secondary and tertiary, five surface levels, success, warning and info, in light and dark at three contrast levels, generated from one colour by the engine the Compose library uses."
        >
          <PaletteCycle />
        </Tile>
        <Tile
          className="md:col-span-2"
          delay={0.06}
          title="Springs, not easings"
          body="Shapes and handles move on Material 3 Expressive springs and settle at once for anyone who prefers reduced motion."
        >
          <MotionDemo />
        </Tile>
        <Tile
          className="md:col-span-2"
          title="Accessible by default"
          body="React Aria handles focus, keyboard and screen readers. Every component is tested with axe in light, dark and right-to-left."
        >
          <A11yDemo />
        </Tile>
        <Tile
          className="md:col-span-2"
          delay={0.06}
          title="Right-to-left, built in"
          body="Logical properties only, so an Arabic or Hebrew page mirrors without a second stylesheet."
        >
          <RtlDemo />
        </Tile>
        <Tile
          className="md:col-span-2"
          delay={0.12}
          title="Your words"
          body="The library ships no translations. Every string it writes on its own is an English default you replace per component or once for the app."
        >
          <LabelsDemo />
        </Tile>
        <Tile
          className="md:col-span-6"
          title="Source you own"
          body="Components install into your project with the shadcn CLI, as files you can read and change."
        >
          <InstallDemo files={installFiles} />
        </Tile>
      </div>
    </section>
  );
}
