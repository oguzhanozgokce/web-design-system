'use client';

import { useState } from 'react';
import {
  DashboardIcon,
  FolderIcon,
  GroupIcon,
  InboxIcon,
  SettingsIcon,
  GridViewIcon,
} from '@/registry/ds/lib/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarLink,
  SidebarProvider,
  SidebarTrigger,
} from '@/registry/ds/ui/sidebar';

const pages = [
  { label: 'Overview', icon: DashboardIcon, detail: 'A clear view of your workspace.' },
  { label: 'Projects', icon: FolderIcon, detail: 'Everything your team is working on.' },
  { label: 'Inbox', icon: InboxIcon, detail: 'Updates that need your attention.' },
  { label: 'Members', icon: GroupIcon, detail: 'The people behind the work.' },
  { label: 'Settings', icon: SettingsIcon, detail: 'Make this workspace your own.' },
];

export default function SidebarDemo() {
  const [active, setActive] = useState('Overview');
  return (
    <SidebarProvider className="h-[29rem] overflow-hidden rounded-container border border-outline-subtle bg-surface-raised">
      <Sidebar aria-label="Workspace">
        <SidebarHeader>
          <div className="flex h-12 items-center gap-3 px-1">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-field bg-primary-solid text-xl text-on-primary-solid">
              <GridViewIcon />
            </span>
            <div className="min-w-0 group-data-[collapsed]/sidebar:sr-only">
              <p className="text-sm font-semibold">Workspace</p>
              <p className="text-xs text-on-surface-variant">Studio plan</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup label="Workspace">
            {pages.slice(0, 4).map(({ label, icon: Icon }) => (
              <SidebarLink
                key={label}
                href={`#workspace-${label.toLowerCase()}`}
                icon={<Icon />}
                isCurrent={active === label}
                badge={label === 'Inbox' ? '6' : undefined}
                onPress={() => setActive(label)}
              >
                {label}
              </SidebarLink>
            ))}
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarLink
            href="#workspace-settings"
            icon={<SettingsIcon />}
            isCurrent={active === 'Settings'}
            onPress={() => setActive('Settings')}
          >
            Settings
          </SidebarLink>
          <div className="flex items-center gap-3 px-1 py-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-soft text-sm font-medium text-on-surface">
              JD
            </span>
            <div className="min-w-0 group-data-[collapsed]/sidebar:sr-only">
              <p className="truncate text-sm font-medium">Jordan Davis</p>
              <p className="text-xs text-on-surface-variant">Personal account</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="min-w-0 flex-1">
        <div className="flex h-16 items-center gap-3 border-b border-outline-subtle px-4">
          <SidebarTrigger />
          <span className="truncate text-sm text-on-surface-variant">Workspace / {active}</span>
        </div>
        <div className="flex flex-col gap-6 p-6">
          <div>
            <p className="mb-2 text-xs font-medium text-primary">YOUR WORKSPACE</p>
            <h3 className="text-2xl font-semibold tracking-tight">{active}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {pages.find((page) => page.label === active)?.detail}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-overlay border border-outline-subtle p-4">
              <p className="text-sm text-on-surface-variant">Active projects</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">12</p>
            </div>
            <div className="rounded-overlay bg-primary-soft p-4 text-on-primary-soft">
              <p className="text-sm font-medium">Room to focus</p>
              <p className="mt-1 text-sm">Collapse the sidebar to keep your tools within reach.</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
