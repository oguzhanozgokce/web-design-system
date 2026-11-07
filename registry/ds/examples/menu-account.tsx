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
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-on-primary-soft',
        className,
      )}
    >
      AM
    </span>
  );
}

export default function MenuAccount() {
  const [theme, setTheme] = useState<Selection>(new Set(['system']));

  return (
    <MenuTrigger>
      <Button
        variant="ghost"
        startIcon={<Initials className="size-7 text-xs font-medium" />}
        endIcon={<ArrowDropDownIcon />}
      >
        Alex Morgan
      </Button>
      <MenuPopover placement="bottom end">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Initials className="size-9 text-sm font-semibold" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-surface">Alex Morgan</p>
            <p className="truncate text-xs text-on-surface-variant">alex@example.com</p>
          </div>
        </div>
        <MenuSeparator />
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
