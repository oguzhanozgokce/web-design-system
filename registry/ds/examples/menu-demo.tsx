'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import {
  ArrowDropDownIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  ShareIcon,
} from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from '@/registry/ds/ui/menu';

const labels: Record<string, string> = {
  edit: 'Edit',
  duplicate: 'Duplicate',
  share: 'Share',
  download: 'Download',
  delete: 'Delete',
};

export default function MenuDemo() {
  const [last, setLast] = useState<Key | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <MenuTrigger>
        <Button variant="outline" endIcon={<ArrowDropDownIcon />}>
          Actions
        </Button>
        <Menu onAction={(key) => setLast(key)}>
          <MenuItem id="edit" startIcon={<EditIcon />} shortcut={['mod', 'E']}>
            Edit
          </MenuItem>
          <MenuItem id="duplicate" startIcon={<CopyIcon />} shortcut={['mod', 'D']}>
            Duplicate
          </MenuItem>
          <MenuItem id="share" startIcon={<ShareIcon />}>
            Share
          </MenuItem>
          <MenuItem id="download" startIcon={<DownloadIcon />} shortcut={['mod', 'shift', 'S']}>
            Download
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="delete" startIcon={<DeleteIcon />} tone="error">
            Delete
          </MenuItem>
        </Menu>
      </MenuTrigger>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        {last != null ? `Last action: ${labels[String(last)]}` : 'No action yet'}
      </p>
    </div>
  );
}
