import {
  FavoriteFilledIcon,
  FavoriteIcon,
  LockIcon,
  LockOpenIcon,
  PauseIcon,
  PlayArrowIcon,
  StarFilledIcon,
  StarIcon,
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
      <IconToggleButton aria-label="Star" icon={<StarIcon />} selectedIcon={<StarFilledIcon />} />
      <IconToggleButton
        variant="soft"
        aria-label="Lock folder"
        icon={<LockOpenIcon />}
        selectedIcon={<LockIcon />}
        defaultSelected
      />
      <IconToggleButton
        variant="soft"
        aria-label="Pause sync"
        icon={<PauseIcon />}
        selectedIcon={<PlayArrowIcon />}
      />
    </div>
  );
}
