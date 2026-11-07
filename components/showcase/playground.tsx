'use client';

import { useState } from 'react';
import {
  ArrowForwardIcon,
  CheckCircleIcon,
  DescriptionIcon,
  FolderIcon,
} from '@/registry/ds/lib/icons';
import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';
import { AreaChart } from '@/registry/ds/ui/area-chart';
import { ButtonLink } from '@/registry/ds/ui/button';
import { Checkbox } from '@/registry/ds/ui/checkbox';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Slider } from '@/registry/ds/ui/slider';
import { Switch } from '@/registry/ds/ui/switch';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';
import { Tag } from '@/registry/ds/ui/tag';
import { PreviewThemePicker, PreviewThemeScope } from '@/components/showcase/preview-theme';

const activity = [
  { day: 'Mon', current: 124, previous: 85 },
  { day: 'Tue', current: 182, previous: 126 },
  { day: 'Wed', current: 156, previous: 104 },
  { day: 'Thu', current: 248, previous: 170 },
  { day: 'Fri', current: 219, previous: 162 },
  { day: 'Sat', current: 304, previous: 206 },
  { day: 'Sun', current: 312, previous: 236 },
];

const tasks = ['Create a workspace', 'Add your first project', 'Invite your team'];
const projects = [
  {
    title: 'Website refresh',
    detail: '12 files · Updated today',
    status: 'In progress',
    tone: 'primary',
  },
  {
    title: 'Component library',
    detail: '8 files · Updated yesterday',
    status: 'In review',
    tone: 'warning',
  },
  {
    title: 'Getting started',
    detail: '4 files · Updated yesterday',
    status: 'Complete',
    tone: 'success',
  },
] as const;

function Workspace() {
  const [period, setPeriod] = useState('current');
  const [completed, setCompleted] = useState([tasks[0]]);
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState(false);
  const [volume, setVolume] = useState(60);
  const total = activity.reduce(
    (sum, day) => sum + (period === 'current' ? day.current : day.previous),
    0,
  );
  const done = completed.length === tasks.length;

  return (
    <div className="overflow-clip rounded-container border border-outline-subtle bg-surface-raised text-on-surface shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-outline-subtle px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-solid text-sm font-semibold text-on-primary-solid"
          >
            w.
          </span>
          <span className="text-sm font-semibold">Workspace</span>
          <span aria-hidden className="hidden text-outline-variant sm:inline">
            /
          </span>
          <span className="hidden text-sm text-on-surface-variant sm:inline">Personal space</span>
        </div>
        <AvatarGroup aria-label="Workspace members" size="sm" max={3}>
          {['Alex Kim', 'Sam Rivera', 'Mia Chen', 'Nora Ali'].map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
      </div>
      <Tabs defaultSelectedKey="overview" className="gap-0 px-5 sm:px-8">
        <TabList aria-label="Workspace preview" className="pt-2">
          <Tab id="overview">Overview</Tab>
          <Tab id="preferences">Preferences</Tab>
        </TabList>
        <TabPanel id="overview" className="py-6 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
            <div className="min-w-0">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-on-surface-variant">Weekly activity</h2>
                  <p className="mt-2 flex items-baseline gap-3">
                    <span className="text-4xl font-medium tracking-tight tabular-nums sm:text-5xl">
                      {total.toLocaleString('en-US')}
                    </span>
                    <span className="text-sm text-on-surface-variant">visits</span>
                  </p>
                </div>
                <SegmentedControl
                  aria-label="Activity period"
                  size="sm"
                  selectedKeys={[period]}
                  onSelectionChange={(keys) => {
                    const [key] = [...keys];
                    if (key != null) setPeriod(String(key));
                  }}
                >
                  <SegmentedControlItem id="previous">Last week</SegmentedControlItem>
                  <SegmentedControlItem id="current">This week</SegmentedControlItem>
                </SegmentedControl>
              </div>
              <AreaChart
                aria-label={period === 'current' ? 'Visits this week' : 'Visits last week'}
                data={activity}
                category="day"
                series={[
                  {
                    id: 'visits',
                    label: 'Visits',
                    value: period === 'current' ? 'current' : 'previous',
                    color: 'primary',
                  },
                ]}
                height={160}
                legend="none"
              />
              <div className="mt-6 border-t border-outline-subtle pt-5">
                <h3 className="mb-2 text-sm font-semibold">Recent projects</h3>
                <ul className="divide-y divide-outline-subtle">
                  {projects.map((project) => (
                    <li key={project.title} className="flex items-center gap-3 py-3">
                      <FolderIcon className="shrink-0 text-xl text-on-surface-variant" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{project.title}</p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">{project.detail}</p>
                      </div>
                      <Tag tone={project.tone} dot>
                        {project.status}
                      </Tag>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="min-w-0 overflow-clip rounded-container border border-outline-subtle bg-canvas">
              <div
                aria-hidden
                className="h-28 w-full bg-cover bg-center"
                style={{ backgroundImage: 'url(/samples/lagoon.jpg)' }}
              />
              <div className="p-5">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">
                      {done ? 'You are all set' : 'Make room for good work.'}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      A few small steps to make this space yours.
                    </p>
                  </div>
                  {done && <CheckCircleIcon className="shrink-0 text-xl text-success" />}
                </div>
                <LinearProgress
                  label="Workspace setup"
                  value={completed.length}
                  maxValue={tasks.length}
                  valueLabel={`${completed.length} of ${tasks.length}`}
                  showValueLabel
                  tone={done ? 'success' : 'primary'}
                />
                <div className="my-5 flex flex-col gap-4">
                  {tasks.map((task) => (
                    <Checkbox
                      key={task}
                      isSelected={completed.includes(task)}
                      onChange={(selected) =>
                        setCompleted((value) =>
                          selected ? [...value, task] : value.filter((item) => item !== task),
                        )
                      }
                    >
                      {task}
                    </Checkbox>
                  ))}
                </div>
                <ButtonLink
                  href="/docs/components/layout/card#onboarding-checklist"
                  variant="ghost"
                  size="sm"
                  endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
                  className="-ms-3"
                >
                  View this pattern
                </ButtonLink>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel id="preferences" className="py-6 sm:min-h-[34rem] sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
            <div className="max-w-xl">
              <h2 className="text-2xl font-medium tracking-tight">A little more your way.</h2>
              <p className="mt-2 mb-8 text-sm text-on-surface-variant">
                Try the controls. Your choices stay here while you explore.
              </p>
              <div className="divide-y divide-outline-subtle">
                <Switch
                  variant="row"
                  isSelected={notifications}
                  onChange={setNotifications}
                  description="Keep up with changes across your projects."
                >
                  Project notifications
                </Switch>
                <Switch
                  variant="row"
                  isSelected={digest}
                  onChange={setDigest}
                  description="A quiet summary at the end of each week."
                >
                  Weekly digest
                </Switch>
              </div>
              <Slider
                className="mt-8"
                label="Notification volume"
                value={volume}
                onChange={setVolume}
                minValue={0}
                maxValue={100}
                showStops={false}
              />
            </div>
            <div className="self-start border-s border-outline-subtle ps-6 text-sm leading-relaxed text-on-surface-variant">
              <DescriptionIcon className="mb-4 text-2xl" />
              <p>
                These are the same components you install. Focus rings, keyboard controls and motion
                preferences are already connected.
              </p>
              <ButtonLink
                href="/docs/foundations/motion"
                variant="ghost"
                size="sm"
                className="-ms-3 mt-4"
              >
                Explore motion <span aria-hidden>↗</span>
              </ButtonLink>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export function Playground() {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs tracking-wide text-on-surface-variant">
          01 / THE PLAYGROUND
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-on-surface-variant">Make it your colour</span>
          <PreviewThemePicker size="sm" />
        </div>
      </div>
      <PreviewThemeScope>
        <Workspace />
      </PreviewThemeScope>
    </div>
  );
}
