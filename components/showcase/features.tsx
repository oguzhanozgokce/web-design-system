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
import { SectionHeading } from '@/components/showcase/section-heading';

const cycle = [
  { name: 'Indigo', seed: '#5b4bff' },
  { name: 'Teal', seed: '#0b8f6a' },
  { name: 'Coral', seed: '#e8613c' },
  { name: 'Amber', seed: '#c98a00' },
  { name: 'Rose', seed: '#c2185b' },
];

const fills = [
  { name: 'solid', className: 'bg-primary-solid text-on-primary-solid' },
  { name: 'soft', className: 'bg-primary-soft text-on-primary-soft' },
  { name: 'neutral', className: 'bg-neutral-soft text-on-surface' },
  { name: 'success', className: 'bg-success-soft text-on-success-soft' },
  { name: 'warning', className: 'bg-warning-soft text-on-warning-soft' },
  { name: 'error', className: 'bg-error-soft text-on-error-soft' },
];

const colorTransition = 'transition-colors duration-500 ease-out motion-reduce:transition-none';

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
        'flex min-w-0 flex-col gap-6 overflow-clip rounded-container border border-outline-subtle bg-surface-raised p-5 sm:p-6',
        className,
      )}
    >
      <div className="flex min-h-40 flex-1 items-center justify-center">{children}</div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-on-surface">{title}</h3>
        <p className="text-sm text-pretty text-on-surface-variant">{body}</p>
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
          <span className="text-sm text-on-surface-variant">
            Seed <span className="font-mono text-on-surface">{current.seed}</span>
          </span>
          <span
            className={cn(
              'rounded-control bg-primary-solid px-2.5 py-0.5 text-xs font-medium text-on-primary-solid',
              colorTransition,
            )}
          >
            {current.name}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {fills.map((fill) => (
            <div
              key={fill.name}
              className={cn(
                'flex h-14 items-end rounded-field px-2.5 py-2 text-xs font-medium',
                colorTransition,
                fill.className,
              )}
            >
              {fill.name}
            </div>
          ))}
        </div>
        <div className="flex gap-2 rounded-field border border-outline-subtle bg-canvas p-2">
          <div className="flex flex-1 flex-col gap-1.5 rounded-item border border-outline-subtle bg-surface-raised p-2.5">
            <span className="text-xs font-medium text-on-surface">Raised</span>
            <span className="h-1.5 w-3/4 rounded-full bg-neutral-soft" />
            <span className="h-1.5 w-1/2 rounded-full bg-neutral-soft" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5 rounded-item bg-surface-overlay p-2.5 shadow-md">
            <span className="text-xs font-medium text-on-surface">Overlay</span>
            <span className={cn('h-1.5 w-2/3 rounded-full bg-primary-solid', colorTransition)} />
            <span className="h-1.5 w-1/2 rounded-full bg-neutral-soft" />
          </div>
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
      <Switch defaultSelected>Sliding handle</Switch>
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
      <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-on-surface-variant">
        Try <Kbd size="sm">Tab</Kbd> and the <Kbd size="sm">←</Kbd>
        <Kbd size="sm">→</Kbd> keys
      </p>
    </div>
  );
}

function RtlRow({ label, action }: { label: string; action: string }) {
  return (
    <div className="flex items-center gap-3 rounded-field border border-outline-subtle bg-canvas p-3">
      <LinearProgress aria-label={label} value={62} className="flex-1" />
      <Button
        size="sm"
        variant="outline"
        endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
      >
        {action}
      </Button>
    </div>
  );
}

function RtlDemo() {
  return (
    <div className="grid w-full gap-3">
      <div dir="ltr">
        <RtlRow label="Upload" action="Next" />
      </div>
      <DSProvider locale="ar-u-nu-latn">
        <div dir="rtl" lang="ar">
          <RtlRow label="الرفع" action="التالي" />
        </div>
      </DSProvider>
    </div>
  );
}

function LabelsDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <pre className="overflow-x-auto rounded-field border border-outline-subtle bg-canvas p-3 font-mono text-xs leading-5 text-on-surface">
        <code>{`<DSProvider labels={{
  divider: { or: 'o' },
}}>`}</code>
      </pre>
      <DSProvider labels={{ divider: { or: 'o' } }}>
        <div lang="es" className="flex flex-col gap-2">
          <Button variant="outline" fullWidth>
            Continuar con una llave de acceso
          </Button>
          <OrDivider />
          <Button fullWidth>Continuar con correo</Button>
        </div>
      </DSProvider>
    </div>
  );
}

const steps = [
  ['Install', 'One command per component, through the shadcn CLI.'],
  ['Own it', 'The file lives in your project. Change a default where it is.'],
  ['Update', 'Diff against the registry and take upstream fixes when you choose.'],
];

function InstallDemo({ files }: { files: string[] }) {
  const command = 'npx shadcn@latest add @ds/button';
  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-3 rounded-overlay bg-inverse-surface p-4 text-inverse-on-surface">
        <div className="flex items-center justify-between gap-3">
          <code className="min-w-0 truncate font-mono text-sm">
            <span className="opacity-60 select-none">$ </span>
            {command}
          </code>
          <CopyButton
            value={command}
            size="sm"
            aria-label="Copy install command"
            className="text-inverse-on-surface data-[hovered]:bg-inverse-surface-hover data-[pressed]:bg-inverse-surface-hover"
          />
        </div>
        <p className="text-xs opacity-80">
          Adds the component and everything it needs, nothing else:
        </p>
        <ul className="flex flex-col gap-1 font-mono text-xs">
          {files.map((file) => (
            <li key={file} className="truncate">
              <span className="opacity-60">+ </span>
              {file}
            </li>
          ))}
        </ul>
      </div>
      <ol className="flex flex-col justify-center gap-5">
        {steps.map(([title, body], index) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-neutral-soft text-xs font-semibold text-on-surface tabular-digits">
              {index + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-on-surface">{title}</p>
              <p className="text-sm text-on-surface-variant">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Features({ installFiles }: { installFiles: string[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
      <SectionHeading
        eyebrow="Why it holds up"
        title="Built like a product, not a template."
        body="Behaviour from React Aria, colour from one seed and source you own, so the same parts hold up on a marketing site, in an admin panel and in a signed-in app."
      />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6">
        <Tile
          className="md:col-span-4"
          title="One seed, every role"
          body="Accent and status colours from one seed, paired with neutral page, raised and overlay layers, in light and dark at three contrast levels."
        >
          <PaletteCycle />
        </Tile>
        <Tile
          className="md:col-span-2"
          delay={0.06}
          title="Quick, calm motion"
          body="Controls press with a slight scale and handles slide on one fluid curve. It all settles at once for anyone who prefers reduced motion."
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
