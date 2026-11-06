'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import {
  ArrowDropDownIcon,
  ContrastIcon,
  DarkModeIcon,
  LightModeIcon,
  LogoutIcon,
  PersonIcon,
  SettingsIcon,
} from '@/registry/ds/lib/icons';
import { cn } from '@/registry/ds/lib/utils';
import { Button } from '@/registry/ds/ui/button';
import {
  MenuHeader,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from '@/registry/ds/ui/menu';

function Initials({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container',
        className,
      )}
    >
      AD
    </span>
  );
}

export default function MenuAccount() {
  const [theme, setTheme] = useState<Selection>(new Set(['system']));

  return (
    <MenuTrigger>
      <Button
        variant="text"
        startIcon={<Initials className="size-7 text-label-md" />}
        endIcon={<ArrowDropDownIcon />}
      >
        Ayşe Demir
      </Button>
      <MenuPopover placement="bottom end">
        <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-3">
          <Initials className="size-10 text-title-sm" />
          <div className="min-w-0">
            <p className="truncate text-title-sm text-on-surface">Ayşe Demir</p>
            <p className="truncate text-body-sm text-on-surface-variant">ayse@example.com</p>
          </div>
        </div>
        <MenuList>
          <MenuItem startIcon={<PersonIcon />}>Profile</MenuItem>
          <MenuItem startIcon={<SettingsIcon />} shortcut={['mod', ',']}>
            Settings
          </MenuItem>
          <MenuSeparator />
          <MenuSection
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={theme}
            onSelectionChange={setTheme}
          >
            <MenuHeader>Theme</MenuHeader>
            <MenuItem id="light" startIcon={<LightModeIcon />}>
              Light
            </MenuItem>
            <MenuItem id="dark" startIcon={<DarkModeIcon />}>
              Dark
            </MenuItem>
            <MenuItem id="system" startIcon={<ContrastIcon />}>
              Match system
            </MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuItem startIcon={<LogoutIcon className="rtl:-scale-x-100" />}>Sign out</MenuItem>
        </MenuList>
      </MenuPopover>
    </MenuTrigger>
  );
}
