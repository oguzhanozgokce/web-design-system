import type { ReactNode } from 'react';
import { Toolbar } from 'react-aria-components';
import { ArchiveIcon, CopyIcon, DeleteIcon, DownloadIcon, UndoIcon } from '@/registry/ds/lib/icons';
import type { KbdKey } from '@/registry/ds/ui/kbd';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Tooltip, TooltipGroup, TooltipTrigger } from '@/registry/ds/ui/tooltip';

const actions: { label: string; hint: string; shortcut: KbdKey[]; icon: ReactNode }[] = [
  { label: 'Undo', hint: 'Undo', shortcut: ['mod', 'Z'], icon: <UndoIcon /> },
  {
    label: 'Copy link',
    hint: 'Copy invoice link',
    shortcut: ['mod', 'shift', 'C'],
    icon: <CopyIcon />,
  },
  {
    label: 'Download',
    hint: 'Download PDF',
    shortcut: ['mod', 'shift', 'D'],
    icon: <DownloadIcon />,
  },
  { label: 'Archive', hint: 'Archive', shortcut: ['E'], icon: <ArchiveIcon /> },
  { label: 'Delete', hint: 'Delete draft', shortcut: ['backspace'], icon: <DeleteIcon /> },
];

export default function TooltipToolbar() {
  return (
    <TooltipGroup placement="bottom" delay={400}>
      <Toolbar
        aria-label="Invoice actions"
        className="flex items-center gap-1 rounded-full bg-surface-container px-2 py-1"
      >
        {actions.map((action) => (
          <TooltipTrigger key={action.label}>
            <IconButton aria-label={action.label} icon={action.icon} />
            <Tooltip shortcut={action.shortcut}>{action.hint}</Tooltip>
          </TooltipTrigger>
        ))}
      </Toolbar>
    </TooltipGroup>
  );
}
