'use client';

import { useState } from 'react';
import { Button as AriaButton, type Key } from 'react-aria-components';
import {
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  FileIcon,
  MoreVerticalIcon,
  OpenInNewIcon,
} from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger, type MenuProps } from '@/registry/ds/ui/menu';

const labels: Record<string, string> = {
  open: 'Opened',
  rename: 'Renaming',
  duplicate: 'Duplicated',
  download: 'Downloading',
  trash: 'Moved to trash:',
};

function FileActions(props: Omit<MenuProps, 'children'>) {
  return (
    <Menu {...props}>
      <MenuItem id="open" startIcon={<OpenInNewIcon />}>
        Open
      </MenuItem>
      <MenuItem id="rename" startIcon={<EditIcon />}>
        Rename
      </MenuItem>
      <MenuItem id="duplicate" startIcon={<CopyIcon />}>
        Duplicate
      </MenuItem>
      <MenuItem id="download" startIcon={<DownloadIcon />}>
        Download
      </MenuItem>
      <MenuSeparator />
      <MenuItem id="trash" startIcon={<DeleteIcon />} tone="destructive">
        Move to trash
      </MenuItem>
    </Menu>
  );
}

export default function MenuContext() {
  const [status, setStatus] = useState('Nothing done yet');
  const run = (key: Key) => setStatus(`${labels[String(key)]} Notes.txt`);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center rounded-lg bg-surface-container-low pe-2">
        <MenuTrigger trigger="contextMenu">
          <AriaButton
            onPress={() => run('open')}
            className="state-layer flex min-w-0 flex-1 cursor-default items-center gap-3 rounded-lg p-4 text-start text-on-surface focus-ring"
          >
            <FileIcon className="size-6 shrink-0 text-on-surface-variant" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-title-sm">Notes.txt</span>
              <span className="block truncate text-body-sm text-on-surface-variant">
                Edited 2 hours ago
              </span>
            </span>
          </AriaButton>
          <FileActions onAction={run} />
        </MenuTrigger>
        <MenuTrigger>
          <IconButton aria-label="Actions for Notes.txt" icon={<MoreVerticalIcon />} />
          <FileActions placement="bottom end" onAction={run} />
        </MenuTrigger>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        Right-click or long-press the file. From the keyboard, press Shift+F10, or Control+Enter on
        a Mac.
      </p>
      <p className="text-body-sm text-on-surface" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
