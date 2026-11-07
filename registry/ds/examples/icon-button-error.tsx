import { BlockIcon, DeleteIcon, LogoutIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonError() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconButton tone="error" aria-label="Delete" icon={<DeleteIcon />} />
      <IconButton tone="error" variant="soft" aria-label="Block" icon={<BlockIcon />} />
      <IconButton
        tone="error"
        variant="outline"
        aria-label="Sign out"
        icon={<LogoutIcon className="rtl:-scale-x-100" />}
      />
      <IconButton tone="error" variant="solid" aria-label="Delete folder" icon={<DeleteIcon />} />
    </div>
  );
}
