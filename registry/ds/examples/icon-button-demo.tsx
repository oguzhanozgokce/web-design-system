import {
  MoreVerticalIcon,
  NotificationsIcon,
  SearchIcon,
  SettingsIcon,
} from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonDemo() {
  return (
    <div className="flex items-center gap-2">
      <IconButton aria-label="Search" icon={<SearchIcon />} />
      <IconButton aria-label="Notifications" icon={<NotificationsIcon />} />
      <IconButton aria-label="Settings" icon={<SettingsIcon />} />
      <IconButton aria-label="More options" icon={<MoreVerticalIcon />} />
    </div>
  );
}
