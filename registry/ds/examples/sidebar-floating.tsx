'use client';

import { useState } from 'react';
import { DashboardIcon, FolderIcon, SettingsIcon } from '@/registry/ds/lib/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarLink,
  SidebarProvider,
  SidebarTrigger,
} from '@/registry/ds/ui/sidebar';

export default function SidebarFloating() {
  const [active, setActive] = useState('Overview');
  return (
    <SidebarProvider defaultCollapsed className="h-72 gap-3">
      <Sidebar variant="floating" side="end" aria-label="Project navigation">
        <SidebarContent>
          <SidebarGroup label="Project">
            {[
              { label: 'Overview', icon: DashboardIcon },
              { label: 'Files', icon: FolderIcon },
              { label: 'Settings', icon: SettingsIcon },
            ].map(({ label, icon: Icon }) => (
              <SidebarLink
                key={label}
                href={`#project-${label.toLowerCase()}`}
                icon={<Icon />}
                isCurrent={active === label}
                onPress={() => setActive(label)}
              >
                {label}
              </SidebarLink>
            ))}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex min-w-0 flex-1 flex-col rounded-container border border-outline-subtle bg-surface-raised p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{active}</h3>
          <SidebarTrigger />
        </div>
        <div className="my-auto py-6">
          <p className="text-xl font-semibold tracking-tight">More space for your work.</p>
          <p className="mt-2 max-w-xs text-sm text-on-surface-variant">
            A floating rail at the logical end. Expand it to see the labels.
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
