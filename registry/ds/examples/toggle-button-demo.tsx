import { StarFilledIcon, StarIcon } from '@/registry/ds/lib/icons';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonDemo() {
  return (
    <ToggleButton startIcon={<StarIcon />} selectedIcon={<StarFilledIcon />}>
      Star
    </ToggleButton>
  );
}
