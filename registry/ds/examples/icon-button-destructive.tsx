import { BlockIcon, DeleteIcon, LogoutIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonDestructive() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconButton tone="destructive" aria-label="Delete transaction" icon={<DeleteIcon />} />
      <IconButton
        tone="destructive"
        variant="tonal"
        aria-label="Block member"
        icon={<BlockIcon />}
      />
      <IconButton
        tone="destructive"
        variant="outlined"
        aria-label="Sign out of all devices"
        icon={<LogoutIcon className="rtl:-scale-x-100" />}
      />
      <IconButton
        tone="destructive"
        variant="filled"
        aria-label="Delete workspace"
        icon={<DeleteIcon />}
      />
    </div>
  );
}
