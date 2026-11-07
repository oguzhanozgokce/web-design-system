'use client';

import { useState, type ComponentType } from 'react';
import type { Key } from 'react-aria-components';
import {
  ArchiveIcon,
  BarChartIcon,
  BookmarkIcon,
  CalendarMonthIcon,
  ChatIcon,
  CopyIcon,
  DeleteIcon,
  DescriptionIcon,
  EditIcon,
  FolderIcon,
  HomeIcon,
  ImageIcon,
  LanguageIcon,
  LightModeIcon,
  LocationOnIcon,
  MailIcon,
  PaletteIcon,
  PauseIcon,
  PlayArrowIcon,
  ScheduleIcon,
  TrendingUpIcon,
  type IconProps,
} from '@/registry/ds/lib/icons';
import { Avatar, type AvatarTone } from '@/registry/ds/ui/avatar';
import { DataTable, type DataTableColumn, type DataTableFilter } from '@/registry/ds/ui/data-table';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import type { StatusDefinitions } from '@/registry/ds/ui/status-tag';
import type { TableDensity } from '@/registry/ds/ui/table';

interface App {
  id: string;
  name: string;
  bundle: string;
  icon: ComponentType<IconProps>;
  tone: AvatarTone;
  platforms: string[];
  version: string;
  status: string;
  downloads: number;
  updated: string;
}

const catalogue: [string, ComponentType<IconProps>, AvatarTone][] = [
  ['Photos', ImageIcon, 'primary'],
  ['Notes', DescriptionIcon, 'warning'],
  ['Weather', LightModeIcon, 'info'],
  ['Music', PlayArrowIcon, 'error'],
  ['Calendar', CalendarMonthIcon, 'error'],
  ['Maps', LocationOnIcon, 'success'],
  ['Mail', MailIcon, 'info'],
  ['Clock', ScheduleIcon, 'neutral'],
  ['Files', FolderIcon, 'info'],
  ['Books', BookmarkIcon, 'warning'],
  ['Fitness', TrendingUpIcon, 'success'],
  ['Translate', LanguageIcon, 'primary'],
  ['Messages', ChatIcon, 'success'],
  ['Home', HomeIcon, 'warning'],
  ['Sketch', PaletteIcon, 'primary'],
  ['Insights', BarChartIcon, 'info'],
];

const platformSets = [
  ['iOS', 'Android', 'Web'],
  ['iOS', 'macOS'],
  ['Android'],
  ['Web', 'Windows', 'macOS', 'Linux'],
  ['iOS', 'Android'],
  ['Web'],
];

const statusCycle = [
  'live',
  'inReview',
  'live',
  'rejected',
  'draft',
  'live',
  'paused',
  'scheduled',
  'beta',
  'processing',
  'live',
  'archived',
];

const appStatuses: StatusDefinitions = {
  beta: { tone: 'primary', dot: true, label: 'Beta' },
};

const initialApps: App[] = Array.from({ length: 32 }, (_, index) => {
  const [base, icon, tone] = catalogue[index % catalogue.length];
  const round = Math.floor(index / catalogue.length);
  const name = round ? `${base} ${['Lite', 'Pro', 'Kids'][round - 1]}` : base;
  const day = 1 + ((index * 11) % 28);
  const month = 1 + ((index * 7) % 10);
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    bundle: `com.example.${name.toLowerCase().replace(/\s+/g, '')}`,
    icon,
    tone,
    platforms: platformSets[index % platformSets.length],
    version: `${1 + (index % 4)}.${(index * 3) % 10}.${index % 5}`,
    status: statusCycle[index % statusCycle.length],
    downloads: Math.round(((index * 7919) % 2400000) + 1200),
    updated: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
});

const platformFilter: DataTableFilter<App> = {
  id: 'platforms',
  label: 'Platform',
  allLabel: 'All platforms',
  options: ['iOS', 'Android', 'Web', 'macOS', 'Windows'].map((id) => ({ id, label: id })),
};

const statusFilter: DataTableFilter<App> = {
  id: 'status',
  label: 'Status',
  allLabel: 'All statuses',
  options: [
    { id: 'live', label: 'Live' },
    { id: 'inReview', label: 'In review' },
    { id: 'beta', label: 'Beta' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'paused', label: 'Paused' },
    { id: 'draft', label: 'Draft' },
    { id: 'rejected', label: 'Rejected' },
  ],
};

function AppIdentity({ app, density }: { app: App; density: TableDensity }) {
  const Icon = app.icon;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        shape="rounded"
        size={density === 'sm' ? 'xs' : 'sm'}
        tone={app.tone}
        fallbackIcon={<Icon />}
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{app.name}</span>
        {density === 'md' ? (
          <span className="truncate text-xs text-on-surface-variant">{app.bundle}</span>
        ) : null}
      </div>
    </div>
  );
}

const columns: DataTableColumn<App>[] = [
  {
    id: 'name',
    header: 'App',
    isRowHeader: true,
    allowsSorting: true,
    minWidth: 200,
    cell: (app, { density }) => <AppIdentity app={app} density={density} />,
  },
  { id: 'platforms', header: 'Platforms', type: 'tags', maxVisibleTags: 2 },
  { id: 'version', header: 'Version', chip: true },
  {
    id: 'status',
    header: 'Status',
    type: 'status',
    statuses: appStatuses,
    allowsSorting: true,
  },
  {
    id: 'downloads',
    header: 'Downloads',
    type: 'number',
    allowsSorting: true,
    formatOptions: { notation: 'compact', maximumFractionDigits: 1 },
  },
  {
    id: 'updated',
    header: 'Updated',
    type: 'date',
    allowsSorting: true,
    formatOptions: { dateStyle: 'medium', timeZone: 'UTC' },
  },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function DataTableDemo() {
  const [apps, setApps] = useState(initialApps);
  const [density, setDensity] = useState<TableDensity>('md');

  function update(id: string, status: string) {
    setApps((current) => current.map((app) => (app.id === id ? { ...app, status } : app)));
  }

  function remove(keys: Set<Key>) {
    setApps((current) => current.filter((app) => !keys.has(app.id)));
  }

  async function duplicate(app: App) {
    await wait(600);
    setApps((current) => {
      const index = current.findIndex((item) => item.id === app.id);
      const copy = {
        ...app,
        id: `${app.id}-${Date.now()}`,
        name: `${app.name} copy`,
        status: 'draft',
      };
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <DataTable
        aria-label="Apps"
        data={apps}
        columns={columns}
        getRowId={(app) => app.id}
        selectionMode="multiple"
        defaultSelectedKeys={new Set(['calendar', 'sketch'])}
        defaultSortDescriptor={{ column: 'updated', direction: 'descending' }}
        filters={[platformFilter, statusFilter]}
        pageSize={8}
        density={density}
        labels={{ resultCount: '{count} apps' }}
        rowActions={[
          { id: 'edit', label: 'Edit', icon: <EditIcon />, onAction: () => {} },
          { id: 'duplicate', label: 'Duplicate', icon: <CopyIcon />, onAction: duplicate },
          {
            id: 'pause',
            label: 'Pause',
            icon: <PauseIcon />,
            onAction: (app) => update(app.id, 'paused'),
          },
          {
            id: 'archive',
            label: 'Archive',
            icon: <ArchiveIcon />,
            onAction: (app) => update(app.id, 'archived'),
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <DeleteIcon />,
            tone: 'error',
            onAction: (app) => remove(new Set([app.id])),
          },
        ]}
        selectionActions={[
          {
            id: 'archive',
            label: 'Archive',
            icon: <ArchiveIcon />,
            onAction: (keys) =>
              setApps((current) =>
                current.map((app) => (keys.has(app.id) ? { ...app, status: 'archived' } : app)),
              ),
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <DeleteIcon />,
            tone: 'error',
            onAction: remove,
          },
        ]}
      />
      <SegmentedControl
        aria-label="Row density"
        size="sm"
        selectedKeys={[density]}
        onSelectionChange={(keys) => {
          const next = [...keys][0];
          if (next) setDensity(next as TableDensity);
        }}
      >
        <SegmentedControlItem id="md">Normal</SegmentedControlItem>
        <SegmentedControlItem id="sm">Compact</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}
