import {
  BookmarkIcon,
  FavoriteFilledIcon,
  FavoriteIcon,
  NotificationsIcon,
  StarFilledIcon,
  StarIcon,
  VisibilityIcon,
  VisibilityOffIcon,
} from '@/registry/ds/lib/icons';
import { IconToggleButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonToggle() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <IconToggleButton
        aria-label="Favourite"
        icon={<FavoriteIcon />}
        selectedIcon={<FavoriteFilledIcon />}
        defaultSelected
      />
      <IconToggleButton
        variant="filled"
        aria-label="Star ledger"
        icon={<StarIcon />}
        selectedIcon={<StarFilledIcon />}
      />
      <IconToggleButton
        variant="tonal"
        aria-label="Show balances"
        icon={<VisibilityOffIcon />}
        selectedIcon={<VisibilityIcon />}
        defaultSelected
      />
      <IconToggleButton variant="outlined" aria-label="Watch thread" icon={<NotificationsIcon />} />
      <IconToggleButton
        variant="outlined"
        aria-label="Save for later"
        icon={<BookmarkIcon />}
        defaultSelected
      />
    </div>
  );
}
