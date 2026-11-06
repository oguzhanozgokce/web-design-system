'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import { Radio, RadioGroup } from 'react-aria-components';
import { useImageSeed } from '@/registry/ds/hooks/use-image-seed';
import {
  ArrowForwardIcon,
  CheckIcon,
  DescriptionIcon,
  DownloadIcon,
  MoreVerticalIcon,
} from '@/registry/ds/lib/icons';
import { effectSpring, spatialSpring } from '@/registry/ds/lib/motion';
import { cn } from '@/registry/ds/lib/utils';
import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';
import { CopyButton } from '@/registry/ds/ui/copy-button';
import { DynamicTheme, useThemeTransition } from '@/registry/ds/ui/dynamic-theme';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { Slider } from '@/registry/ds/ui/slider';
import { Switch } from '@/registry/ds/ui/switch';
import { Tag } from '@/registry/ds/ui/tag';

const seeds = [
  { name: 'Indigo', seed: '#5b4bff' },
  { name: 'Teal', seed: '#0b8f6a' },
  { name: 'Coral', seed: '#e8613c' },
  { name: 'Amber', seed: '#c98a00' },
  { name: 'Rose', seed: '#c2185b' },
];

const photos = [
  { name: 'Lagoon photo', src: '/samples/lagoon.jpg' },
  { name: 'Dusk photo', src: '/samples/dusk.jpg' },
];

const team = ['Alex Kim', 'Sam Rivera', 'Mia Chen', 'Leo Okafor', 'Nora Ali'];

const ring =
  'focus-ring cursor-pointer outline-offset-2 data-[selected]:ring-2 data-[selected]:ring-on-surface data-[selected]:ring-offset-2 data-[selected]:ring-offset-surface';

function Panel({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        default: { ...spatialSpring('slow'), delay: 0.12 + index * 0.07 },
        opacity: { ...effectSpring('slow'), delay: 0.12 + index * 0.07 },
      }}
      className={cn(
        'rounded-xl bg-surface-container-low p-4 text-on-surface shadow-elevation-1',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function ThemedWorkspace() {
  return (
    <div className="grid grid-cols-6 gap-3">
      <Panel index={0} className="col-span-6 flex flex-col gap-4 sm:col-span-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-label-lg text-on-surface-variant">Storage</p>
            <p className="mt-1 text-display-sm text-on-surface tabular-digits">
              72 GB <span className="text-title-md text-on-surface-variant">of 100 GB</span>
            </p>
          </div>
          <Tag tone="success" dot>
            Synced
          </Tag>
        </div>
        <LinearProgress aria-label="Storage used" value={72} />
        <ChipGroup
          aria-label="File types"
          selectionMode="single"
          disallowEmptySelection
          defaultSelectedKeys={['photos']}
        >
          <Chip id="photos">Photos</Chip>
          <Chip id="videos">Videos</Chip>
          <Chip id="documents">Documents</Chip>
        </ChipGroup>
      </Panel>
      <Panel
        index={1}
        className="col-span-6 flex flex-col justify-between gap-4 bg-primary text-on-primary sm:col-span-2"
      >
        <div>
          <p className="text-title-sm">Team</p>
          <p className="text-body-sm opacity-80">5 members</p>
        </div>
        <AvatarGroup aria-label="Team members" max={3} size="sm">
          {team.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
        <Button size="sm" variant="elevated" className="self-start">
          Invite
        </Button>
      </Panel>
      <Panel index={2} className="col-span-6 flex flex-col gap-1 p-2 sm:col-span-3">
        <Switch variant="row" defaultSelected>
          Notifications
        </Switch>
        <Switch variant="row">Auto-update</Switch>
      </Panel>
      <Panel index={3} className="col-span-6 flex flex-col justify-center sm:col-span-3">
        <Slider
          label="Volume"
          defaultValue={0.6}
          formatOptions={{ style: 'percent' }}
          minValue={0}
          maxValue={1}
          step={0.01}
          showStops={false}
        />
      </Panel>
      <Panel index={4} className="col-span-6 flex items-center gap-3 py-3">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-md bg-tertiary-container text-on-tertiary-container"
        >
          <DescriptionIcon className="text-xl" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-title-sm">Project brief.pdf</p>
          <p className="truncate text-body-sm text-on-surface-variant">2.4 MB · Edited today</p>
        </div>
        <IconButton aria-label="Download" icon={<DownloadIcon />} />
        <IconButton aria-label="More actions" icon={<MoreVerticalIcon />} />
      </Panel>
    </div>
  );
}

export function Hero({ componentCount }: { componentCount: number }) {
  const [choice, setChoice] = useState(seeds[0].seed);
  const [lastSeed, setLastSeed] = useState(seeds[0].seed);
  const photo = photos.find((item) => item.src === choice);
  const { seed: photoSeed } = useImageSeed(photo?.src ?? null);
  const transition = useThemeTransition();
  const seed = photo ? (photoSeed ?? lastSeed) : choice;

  if (photo && photoSeed && photoSeed !== lastSeed) setLastSeed(photoSeed);
  if (!photo && choice !== lastSeed) setLastSeed(choice);

  return (
    <section className="relative isolate overflow-clip">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-10 h-[32rem] bg-[radial-gradient(45%_55%_at_70%_35%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent)] blur-2xl"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:pt-24">
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ default: spatialSpring('slow'), opacity: effectSpring('slow') }}
          className="flex flex-col items-start gap-6"
        >
          <span className="rounded-full bg-secondary-container px-3 py-1 text-label-md text-on-secondary-container">
            Material 3 · React Aria · Tailwind 4
          </span>
          <h1 className="text-display-sm text-balance text-on-background sm:text-display-md lg:text-display-lg">
            One colour in. A whole design system out.
          </h1>
          <p className="max-w-xl text-body-lg text-pretty text-on-surface-variant">
            {componentCount} accessible React components for marketing sites, admin panels and
            dashboards. Every role comes from one seed colour, motion runs on real springs, layouts
            mirror for right-to-left, and each component installs as source you own.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href="/docs"
              size="lg"
              endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
            >
              Get started
            </ButtonLink>
            <ButtonLink href="#components" size="lg" variant="tonal">
              Browse components
            </ButtonLink>
          </div>
          <div className="flex max-w-full items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low py-1 ps-4 pe-1">
            <code className="min-w-0 truncate font-mono text-body-sm text-on-surface">
              npx shadcn@latest add @ds/button
            </code>
            <CopyButton
              value="npx shadcn@latest add @ds/button"
              aria-label="Copy install command"
            />
          </div>
        </motion.div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p id="hero-theme-label" className="text-label-lg text-on-surface-variant">
              Theme it with a colour or a photo
            </p>
            <RadioGroup
              aria-labelledby="hero-theme-label"
              orientation="horizontal"
              value={choice}
              onChange={(value) => transition(() => setChoice(value))}
              className="flex flex-wrap items-center gap-2"
            >
              {seeds.map((item) => (
                <Radio
                  key={item.seed}
                  value={item.seed}
                  aria-label={item.name}
                  className={cn(ring, 'grid size-9 place-items-center rounded-full')}
                >
                  {({ isSelected }) => (
                    <DynamicTheme
                      seed={item.seed}
                      paletteStyle="fidelity"
                      contrast="standard"
                      className="grid size-7 place-items-center rounded-full bg-primary-container text-on-primary-container"
                    >
                      {isSelected ? <CheckIcon className="text-base" /> : null}
                    </DynamicTheme>
                  )}
                </Radio>
              ))}
              {photos.map((item) => (
                <Radio
                  key={item.src}
                  value={item.src}
                  aria-label={item.name}
                  className={cn(ring, 'overflow-hidden rounded-full')}
                >
                  <Image
                    src={item.src}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 object-cover"
                  />
                </Radio>
              ))}
            </RadioGroup>
          </div>
          <DynamicTheme seed={seed} paletteStyle="vibrant" className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_30%_25%,var(--primary-container),transparent),radial-gradient(50%_50%_at_85%_85%,var(--tertiary-container),transparent)] opacity-35 blur-2xl"
            />
            <ThemedWorkspace />
          </DynamicTheme>
        </div>
      </div>
    </section>
  );
}
