import { ArchiveIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Tooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

export default function TooltipDemo() {
  return (
    <TooltipTrigger>
      <IconButton aria-label="Archive" icon={<ArchiveIcon />} />
      <Tooltip>Archive invoice</Tooltip>
    </TooltipTrigger>
  );
}
