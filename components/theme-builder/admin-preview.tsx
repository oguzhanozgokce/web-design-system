'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useLocale } from 'react-aria-components';
import { AddIcon, ArrowForwardIcon, TrendingDownIcon } from '@/registry/ds/lib/icons';
import { Avatar } from '@/registry/ds/ui/avatar';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/registry/ds/ui/card';
import { Checkbox } from '@/registry/ds/ui/checkbox';
import { FilterChip } from '@/registry/ds/ui/chip';
import { LinearProgress } from '@/registry/ds/ui/progress';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';
import { Switch } from '@/registry/ds/ui/switch';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';
import { Tag, type TagTone } from '@/registry/ds/ui/tag';
import { TextField } from '@/registry/ds/ui/text-field';

type TaskStatus = 'overdue' | 'active' | 'done' | 'draft';

interface Task {
  id: string;
  title: string;
  project: string;
  due: Date;
  status: TaskStatus;
}

const tasks: Task[] = [
  {
    id: 'task-118',
    title: 'Update the FAQ',
    project: 'Help center',
    due: new Date(2026, 9, 28),
    status: 'overdue',
  },
  {
    id: 'task-121',
    title: 'Review the new icons',
    project: 'Mobile app',
    due: new Date(2026, 10, 1),
    status: 'overdue',
  },
  {
    id: 'task-124',
    title: 'Fix the sign-up form',
    project: 'Website',
    due: new Date(2026, 10, 3),
    status: 'overdue',
  },
  {
    id: 'task-127',
    title: 'Plan the team offsite',
    project: 'Team',
    due: new Date(2026, 10, 12),
    status: 'active',
  },
  {
    id: 'task-130',
    title: 'Publish the release notes',
    project: 'Mobile app',
    due: new Date(2026, 10, 2),
    status: 'done',
  },
  {
    id: 'task-133',
    title: 'Draft the newsletter',
    project: 'Website',
    due: new Date(2026, 10, 20),
    status: 'draft',
  },
];

const members = [
  { name: 'Amara Okafor', email: 'amara@example.com', role: 'Owner' },
  { name: 'Kenji Watanabe', email: 'kenji@example.com', role: 'Editor' },
  { name: 'Sofia Rossi', email: 'sofia@example.com', role: 'Viewer' },
];

const statusOrder: TaskStatus[] = ['overdue', 'active', 'done', 'draft'];

const statusLabels: Record<TaskStatus, string> = {
  overdue: 'Overdue',
  active: 'In progress',
  done: 'Done',
  draft: 'Draft',
};

const statusTones: Record<TaskStatus, TagTone> = {
  overdue: 'error',
  active: 'primary',
  done: 'success',
  draft: 'neutral',
};

function useFormatters() {
  const { locale } = useLocale();
  return useMemo(
    () => ({
      count: new Intl.NumberFormat(locale),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
      days: new Intl.NumberFormat(locale, { style: 'unit', unit: 'day', unitDisplay: 'long' }),
    }),
    [locale],
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  return (
    <Tag tone={statusTones[status]} size="sm" dot className="shrink-0">
      {statusLabels[status]}
    </Tag>
  );
}

function TaskList({ items }: { items: Task[] }) {
  const format = useFormatters();

  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-on-surface-variant">
        No tasks match these filters.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-outline-subtle">
      {items.map((task) => (
        <li key={task.id} className="flex items-center gap-3 py-2.5">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-on-surface">{task.title}</span>
            <span className="truncate text-xs text-on-surface-variant">
              {task.project} · due {format.day.format(task.due)}
            </span>
          </span>
          <StatusPill status={task.status} />
        </li>
      ))}
    </ul>
  );
}

function Metric({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <Card variant="outline" className="gap-2">
      <p className="text-sm font-medium text-on-surface-variant">{label}</p>
      <p className="text-2xl font-semibold tracking-tight text-on-surface tabular-digits">
        {value}
      </p>
      {children}
    </Card>
  );
}

function OverviewPanel() {
  const format = useFormatters();
  const [overdueOnly, setOverdueOnly] = useState(false);
  const recent = overdueOnly
    ? tasks.filter((task) => task.status === 'overdue')
    : tasks.slice(0, 4);

  return (
    <TabPanel id="overview" className="flex flex-col gap-4 p-4 @2xl:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-on-surface">November overview</h3>
          <p className="text-xs text-on-surface-variant">Updated 4 minutes ago</p>
        </div>
        <SegmentedControl aria-label="Report period" size="sm" defaultSelectedKeys={['month']}>
          <SegmentedControlItem id="week">Week</SegmentedControlItem>
          <SegmentedControlItem id="month">Month</SegmentedControlItem>
          <SegmentedControlItem id="quarter">Quarter</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <Banner
        tone="warning"
        title="3 tasks are overdue"
        description="Help center, Mobile app and Website each have a task past its due date. Reminders go out tomorrow at 09:00."
        actions={
          <Button variant="ghost" size="sm">
            Send reminders now
          </Button>
        }
      />

      <div className="grid gap-3 @xl:grid-cols-3">
        <Metric label="Completed" value={format.count.format(48)}>
          <LinearProgress label={`Goal ${format.count.format(67)}`} value={72} showValueLabel />
        </Metric>
        <Metric label="Open" value={format.count.format(12)}>
          <p className="text-xs text-on-surface-variant">3 overdue, 9 on track</p>
        </Metric>
        <Metric label="Average time to finish" value={format.days.format(4)}>
          <p className="flex items-center gap-1 text-xs text-success [&_svg]:size-4">
            <TrendingDownIcon className="rtl:-scale-x-100" />1 day faster than October
          </p>
        </Metric>
      </div>

      <div className="grid items-start gap-4 @3xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card variant="outline">
          <CardHeader
            action={
              <FilterChip size="sm" isSelected={overdueOnly} onChange={setOverdueOnly}>
                Overdue only
              </FilterChip>
            }
          >
            <CardTitle level={4}>Recent tasks</CardTitle>
            <CardDescription>Sorted by due date</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList items={recent} />
          </CardContent>
          <CardFooter>
            <Button
              variant="soft"
              size="sm"
              endIcon={<ArrowForwardIcon className="rtl:-scale-x-100" />}
            >
              All tasks
            </Button>
          </CardFooter>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle level={4}>Notifications</CardTitle>
            <CardDescription>Applies to every project you follow.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Switch defaultSelected description="A daily summary, plus mentions right away.">
              Email me
            </Switch>
            <Checkbox defaultSelected>Include the weekly report</Checkbox>
            <TextField label="Email" type="email" defaultValue="alex@example.com" />
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="ghost">Discard</Button>
            <Button>Save</Button>
          </CardFooter>
        </Card>
      </div>
    </TabPanel>
  );
}

function TasksPanel() {
  const [statuses, setStatuses] = useState<Set<TaskStatus>>(() => new Set(['overdue', 'active']));
  const visible = tasks.filter((task) => statuses.has(task.status));

  function toggle(status: TaskStatus, isSelected: boolean) {
    setStatuses((current) => {
      const next = new Set(current);
      if (isSelected) next.add(status);
      else next.delete(status);
      return next;
    });
  }

  return (
    <TabPanel id="tasks" className="flex flex-col gap-4 p-4 @2xl:p-6">
      <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
        {statusOrder.map((status) => (
          <FilterChip
            key={status}
            size="sm"
            isSelected={statuses.has(status)}
            onChange={(isSelected) => toggle(status, isSelected)}
          >
            {statusLabels[status]}
          </FilterChip>
        ))}
      </div>
      <TaskList items={visible} />
    </TabPanel>
  );
}

function MembersPanel() {
  return (
    <TabPanel id="members" className="flex flex-col gap-4 p-4 @2xl:p-6">
      <ul className="flex flex-col divide-y divide-outline-subtle">
        {members.map((member) => (
          <li key={member.email} className="flex items-center gap-3 py-2.5">
            <Avatar name={member.name} size="sm" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-on-surface">{member.name}</span>
              <span className="truncate text-xs text-on-surface-variant">{member.email}</span>
            </span>
            <span className="text-sm text-on-surface-variant">{member.role}</span>
          </li>
        ))}
      </ul>
      <Button variant="outline" startIcon={<AddIcon />} className="self-start">
        Invite a member
      </Button>
    </TabPanel>
  );
}

export function AdminPreview() {
  return (
    <div data-slot="admin-preview" className="@container flex flex-col">
      <div className="flex items-center gap-3 border-b border-outline-subtle bg-surface-raised px-4 py-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-field bg-primary-solid text-base font-semibold text-on-primary-solid"
        >
          P
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-on-surface">Projects</span>
          <span className="truncate text-xs text-on-surface-variant">Team workspace</span>
        </span>
        <Button size="sm" startIcon={<AddIcon />}>
          New project
        </Button>
      </div>
      <Tabs defaultSelectedKey="overview" className="gap-0">
        <TabList aria-label="Workspace">
          <Tab id="overview">Overview</Tab>
          <Tab id="tasks" badge={3}>
            Tasks
          </Tab>
          <Tab id="members">Members</Tab>
        </TabList>
        <OverviewPanel />
        <TasksPanel />
        <MembersPanel />
      </Tabs>
    </div>
  );
}
