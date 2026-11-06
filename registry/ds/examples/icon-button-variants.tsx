import { SettingsIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconButton variant="standard" aria-label="Settings, standard" icon={<SettingsIcon />} />
      <IconButton variant="filled" aria-label="Settings, filled" icon={<SettingsIcon />} />
      <IconButton variant="tonal" aria-label="Settings, tonal" icon={<SettingsIcon />} />
      <IconButton variant="outlined" aria-label="Settings, outlined" icon={<SettingsIcon />} />
    </div>
  );
}
