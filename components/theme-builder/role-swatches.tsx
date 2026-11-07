'use client';

import { useId } from 'react';
import type { BrandColors, ColorRole } from '@/registry/ds/lib/color-scheme';
import { cn } from '@/registry/ds/lib/utils';

type Swatch =
  | { kind: 'pair'; role: ColorRole; on: ColorRole }
  | { kind: 'surface'; role: ColorRole }
  | { kind: 'sample'; role: ColorRole };

interface SwatchGroup {
  title: string;
  description: string;
  columns: string;
  swatches: Swatch[];
}

function pair(role: ColorRole, on: ColorRole): Swatch {
  return { kind: 'pair', role, on };
}

function surface(role: ColorRole): Swatch {
  return { kind: 'surface', role };
}

function sample(role: ColorRole): Swatch {
  return { kind: 'sample', role };
}

export const swatchGroups: SwatchGroup[] = [
  {
    title: 'Layers',
    description:
      'The page, the panels on it, the menus above them, and the selected segment and switch thumb.',
    columns: '@2xl:grid-cols-3',
    swatches: [
      sample('canvas'),
      sample('surface-raised'),
      sample('surface-overlay'),
      sample('surface-segment'),
      sample('surface-thumb'),
    ],
  },
  {
    title: 'Solid fills',
    description:
      'The main action, checked controls and solid badges. In dark mode they keep the saturated light colour.',
    columns: '@3xl:grid-cols-5',
    swatches: [
      pair('primary-solid', 'on-primary-solid'),
      pair('error-solid', 'on-error-solid'),
      pair('success-solid', 'on-success-solid'),
      pair('warning-solid', 'on-warning-solid'),
      pair('info-solid', 'on-info-solid'),
    ],
  },
  {
    title: 'Accent',
    description:
      'Links, ghost and outline labels, icons and the focus ring. Each colour pairs with its on-colour.',
    columns: '@3xl:grid-cols-4',
    swatches: [
      pair('primary', 'on-primary'),
      pair('secondary', 'on-secondary'),
      pair('tertiary', 'on-tertiary'),
      pair('error', 'on-error'),
    ],
  },
  {
    title: 'Status',
    description: 'Success, warning and info, harmonised toward the seed.',
    columns: '@2xl:grid-cols-3',
    swatches: [
      pair('success', 'on-success'),
      pair('warning', 'on-warning'),
      pair('info', 'on-info'),
    ],
  },
  {
    title: 'Containers',
    description: 'Strong tinted fills, for the rare place that needs more than a soft fill.',
    columns: '@3xl:grid-cols-4',
    swatches: [
      pair('primary-container', 'on-primary-container'),
      pair('secondary-container', 'on-secondary-container'),
      pair('tertiary-container', 'on-tertiary-container'),
      pair('error-container', 'on-error-container'),
      pair('success-container', 'on-success-container'),
      pair('warning-container', 'on-warning-container'),
      pair('info-container', 'on-info-container'),
    ],
  },
  {
    title: 'Surfaces',
    description: 'The neutral scale the layers come from. Text on all of them is on-surface.',
    columns: '@3xl:grid-cols-4',
    swatches: [
      pair('surface', 'on-surface'),
      pair('surface-variant', 'on-surface-variant'),
      pair('background', 'on-background'),
      pair('inverse-surface', 'inverse-on-surface'),
      surface('surface-dim'),
      surface('surface-bright'),
      surface('surface-container-lowest'),
      surface('surface-container-low'),
      surface('surface-container'),
      surface('surface-container-high'),
      surface('surface-container-highest'),
    ],
  },
  {
    title: 'Fixed',
    description: 'The same in light and dark, for surfaces that must not flip with the theme.',
    columns: '@2xl:grid-cols-3',
    swatches: [
      pair('primary-fixed', 'on-primary-fixed'),
      pair('secondary-fixed', 'on-secondary-fixed'),
      pair('tertiary-fixed', 'on-tertiary-fixed'),
      pair('primary-fixed-dim', 'on-primary-fixed-variant'),
      pair('secondary-fixed-dim', 'on-secondary-fixed-variant'),
      pair('tertiary-fixed-dim', 'on-tertiary-fixed-variant'),
    ],
  },
  {
    title: 'Lines and overlays',
    description: 'Borders, dividers, the tint on raised surfaces and the colour behind dialogs.',
    columns: '@2xl:grid-cols-3',
    swatches: [
      sample('outline'),
      sample('outline-variant'),
      sample('inverse-primary'),
      sample('surface-tint'),
      sample('scrim'),
      sample('shadow'),
    ],
  },
];

function cssVar(role: ColorRole) {
  return `var(--${role})`;
}

function Hex({ value }: { value: string }) {
  return <span className="font-mono text-xs">{value}</span>;
}

function SwatchTile({ swatch, colors }: { swatch: Swatch; colors: BrandColors }) {
  if (swatch.kind === 'sample') {
    return (
      <li
        data-role={swatch.role}
        className="flex items-center gap-3 rounded-item border border-outline-subtle bg-surface-raised p-3 text-on-surface"
      >
        <span
          aria-hidden
          className="size-10 shrink-0 rounded-lg border border-outline-subtle"
          style={{ background: cssVar(swatch.role) }}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium wrap-anywhere">{swatch.role}</span>
          <span className="text-on-surface-variant">
            <Hex value={colors[swatch.role]} />
          </span>
        </span>
      </li>
    );
  }

  const on = swatch.kind === 'pair' ? swatch.on : 'on-surface';

  return (
    <li
      data-role={swatch.role}
      data-on-role={swatch.kind === 'pair' ? swatch.on : undefined}
      className="flex flex-col overflow-hidden rounded-item border border-outline-subtle"
    >
      <span
        className="flex min-h-20 flex-1 flex-col justify-between gap-3 p-3"
        style={{ background: cssVar(swatch.role), color: cssVar(on) }}
      >
        <span className="text-sm font-medium wrap-anywhere">{swatch.role}</span>
        <Hex value={colors[swatch.role]} />
      </span>
      {swatch.kind === 'pair' ? (
        <span
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-3 py-2"
          style={{ background: cssVar(swatch.on), color: cssVar(swatch.role) }}
        >
          <span className="text-xs font-medium wrap-anywhere">{swatch.on}</span>
          <Hex value={colors[swatch.on]} />
        </span>
      ) : null}
    </li>
  );
}

export function RoleSwatches({ colors }: { colors: BrandColors }) {
  const baseId = useId();

  return (
    <div data-slot="role-swatches" className="@container flex flex-col gap-8 p-4 sm:p-6">
      {swatchGroups.map((group, index) => {
        const titleId = `${baseId}-${index}`;
        return (
          <section key={group.title} aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 id={titleId} className="text-base font-semibold text-on-surface">
                {group.title}
              </h3>
              <p className="text-sm text-on-surface-variant">{group.description}</p>
            </div>
            <ul className={cn('grid grid-cols-2 gap-2', group.columns)}>
              {group.swatches.map((swatch) => (
                <SwatchTile key={swatch.role} swatch={swatch} colors={colors} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
