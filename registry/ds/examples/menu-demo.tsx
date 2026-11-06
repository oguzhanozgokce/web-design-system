'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import {
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  MailIcon,
  MoreVerticalIcon,
} from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from '@/registry/ds/ui/menu';

const labels: Record<string, string> = {
  edit: 'Edit',
  duplicate: 'Duplicate',
  download: 'Download PDF',
  remind: 'Send reminder',
  delete: 'Delete',
};

export default function MenuDemo() {
  const [last, setLast] = useState<Key | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center gap-2 rounded-lg bg-surface-container-low py-3 ps-4 pe-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-title-sm text-on-surface">Invoice INV-2048</p>
          <p className="truncate text-body-sm text-on-surface-variant">
            Northwind Traders, due 14 Nov
          </p>
        </div>
        <MenuTrigger>
          <IconButton aria-label="More actions for INV-2048" icon={<MoreVerticalIcon />} />
          <Menu placement="bottom end" onAction={(key) => setLast(key)}>
            <MenuItem id="edit" startIcon={<EditIcon />} shortcut={['mod', 'E']}>
              Edit
            </MenuItem>
            <MenuItem id="duplicate" startIcon={<CopyIcon />} shortcut={['mod', 'D']}>
              Duplicate
            </MenuItem>
            <MenuItem id="download" startIcon={<DownloadIcon />} shortcut={['mod', 'shift', 'S']}>
              Download PDF
            </MenuItem>
            <MenuItem id="remind" startIcon={<MailIcon />}>
              Send reminder
            </MenuItem>
            <MenuSeparator />
            <MenuItem id="delete" startIcon={<DeleteIcon />} tone="destructive">
              Delete
            </MenuItem>
          </Menu>
        </MenuTrigger>
      </div>
      <p className="px-4 text-body-sm text-on-surface-variant" aria-live="polite">
        {last != null ? `Last action: ${labels[String(last)]}` : 'No action yet'}
      </p>
    </div>
  );
}
