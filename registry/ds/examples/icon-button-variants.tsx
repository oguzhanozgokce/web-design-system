import { SettingsIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconButton variant="ghost" aria-label="Settings, ghost" icon={<SettingsIcon />} />
      <IconButton variant="soft" aria-label="Settings, soft" icon={<SettingsIcon />} />
      <IconButton variant="outline" aria-label="Settings, outline" icon={<SettingsIcon />} />
      <IconButton variant="solid" aria-label="Settings, solid" icon={<SettingsIcon />} />
    </div>
  );
}
