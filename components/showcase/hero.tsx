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
import { entrance } from '@/components/showcase/motion';
import { swatchRadio } from '@/components/showcase/preview-theme';

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

const installCommand = 'npx shadcn@4.23.0 add @ds/button';

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
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={entrance(0.1 + index * 0.06, 0.7)}
      className={cn(
        'rounded-container border border-outline-subtle bg-surface-raised p-4 text-on-surface shadow-xs',
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
            <p className="text-sm font-medium text-on-surface-variant">Storage</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-on-surface tabular-digits">
              72 GB{' '}
              <span className="text-base font-medium tracking-normal text-on-surface-variant">
                of 100 GB
              </span>
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
      <Panel index={1} className="col-span-6 flex flex-col justify-between gap-4 sm:col-span-2">
        <div>
          <p className="text-sm font-semibold">Team</p>
          <p className="text-xs text-on-surface-variant">5 members</p>
        </div>
        <AvatarGroup aria-label="Team members" max={3} size="sm">
          {team.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
        <Button size="sm" className="self-start">
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
          className="grid size-10 shrink-0 place-items-center rounded-field bg-primary-soft text-on-primary-soft"
        >
          <DescriptionIcon className="text-xl" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Project brief.pdf</p>
          <p className="truncate text-xs text-on-surface-variant">2.4 MB · Edited today</p>
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
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-14 pb-12 sm:pt-20 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:pt-24">
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={entrance(0, 0.7)}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex max-w-full items-center gap-2 rounded-control border border-outline-subtle bg-surface-raised py-1 ps-1 pe-3 text-xs font-medium text-on-surface-variant shadow-xs">
            <span className="rounded-control bg-neutral-soft px-2 py-0.5 text-on-surface tabular-digits">
              {componentCount}
            </span>
            <span className="truncate">components on React Aria and Tailwind 4</span>
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-on-surface sm:text-5xl lg:text-6xl">
            One colour in.{' '}
            <span className="text-on-surface-variant">A whole design system out.</span>
          </h1>
          <p className="max-w-xl text-base text-pretty text-on-surface-variant sm:text-lg">
            Accessible React components for marketing sites, admin panels and dashboards. Every
            colour comes from one seed, controls respond with quick, calm motion, layouts mirror for
            right-to-left, and each component installs as source you own.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href="/docs"
              size="lg"
              endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
            >
              Get started
            </ButtonLink>
            <ButtonLink href="#components" size="lg" variant="soft">
              Browse components
            </ButtonLink>
          </div>
          <div className="flex max-w-full items-center gap-2 rounded-control border border-outline-subtle bg-surface-raised py-1 ps-4 pe-1 shadow-xs">
            <code className="min-w-0 truncate font-mono text-sm text-on-surface">
              <span className="text-on-surface-variant select-none">$ </span>
              {installCommand}
            </code>
            <CopyButton value={installCommand} size="sm" aria-label="Copy install command" />
          </div>
        </motion.div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p id="hero-theme-label" className="text-sm font-medium text-on-surface-variant">
              Theme it with a colour or a photo
            </p>
            <RadioGroup
              aria-labelledby="hero-theme-label"
              orientation="horizontal"
              value={choice}
              onChange={(value) => transition(() => setChoice(value))}
              className="flex flex-wrap items-center gap-1"
            >
              {seeds.map((item) => (
                <Radio
                  key={item.seed}
                  value={item.seed}
                  aria-label={item.name}
                  className={cn(swatchRadio, 'size-9')}
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
                  className={cn(swatchRadio, 'size-9')}
                >
                  <Image
                    src={item.src}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 rounded-full object-cover"
                  />
                </Radio>
              ))}
            </RadioGroup>
          </div>
          <DynamicTheme seed={seed} paletteStyle="vibrant" className="relative">
            <div
              aria-hidden
              className="absolute -inset-x-4 -inset-y-8 -z-10 rounded-[3rem] bg-[radial-gradient(55%_55%_at_30%_30%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)] blur-2xl sm:-inset-8"
            />
            <ThemedWorkspace />
          </DynamicTheme>
        </div>
      </div>
    </section>
  );
}
