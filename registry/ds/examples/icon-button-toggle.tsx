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
        aria-label="Like"
        icon={<FavoriteIcon />}
        selectedIcon={<FavoriteFilledIcon />}
        defaultSelected
      />
      <IconToggleButton
        variant="filled"
        aria-label="Star"
        icon={<StarIcon />}
        selectedIcon={<StarFilledIcon />}
      />
      <IconToggleButton
        variant="tonal"
        aria-label="Show password"
        icon={<VisibilityOffIcon />}
        selectedIcon={<VisibilityIcon />}
        defaultSelected
      />
      <IconToggleButton
        variant="outlined"
        aria-label="Notifications"
        icon={<NotificationsIcon />}
      />
      <IconToggleButton
        variant="outlined"
        aria-label="Bookmark"
        icon={<BookmarkIcon />}
        defaultSelected
      />
    </div>
  );
}
