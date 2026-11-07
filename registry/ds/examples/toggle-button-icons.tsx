import {
  FavoriteFilledIcon,
  FavoriteIcon,
  NotificationsIcon,
  VisibilityIcon,
  VisibilityOffIcon,
} from '@/registry/ds/lib/icons';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ToggleButton startIcon={<FavoriteIcon />} selectedIcon={<FavoriteFilledIcon />}>
        Like
      </ToggleButton>
      <ToggleButton
        variant="ghost"
        startIcon={<VisibilityOffIcon />}
        selectedIcon={<VisibilityIcon />}
      >
        Show hidden
      </ToggleButton>
      <ToggleButton variant="ghost" endIcon={<NotificationsIcon />}>
        Notifications
      </ToggleButton>
    </div>
  );
}
