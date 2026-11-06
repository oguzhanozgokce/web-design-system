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
        Favourite
      </ToggleButton>
      <ToggleButton
        variant="outlined"
        startIcon={<VisibilityOffIcon />}
        selectedIcon={<VisibilityIcon />}
      >
        Show balances
      </ToggleButton>
      <ToggleButton variant="tonal" endIcon={<NotificationsIcon />}>
        Payout alerts
      </ToggleButton>
    </div>
  );
}
