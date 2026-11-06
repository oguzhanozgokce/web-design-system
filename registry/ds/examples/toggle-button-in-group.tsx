import { DownloadIcon, ShareIcon, StarFilledIcon, StarIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonInGroup() {
  return (
    <ButtonGroup aria-label="Report actions" buttonVariant="tonal" size="sm">
      <ToggleButton startIcon={<StarIcon />} selectedIcon={<StarFilledIcon />}>
        Star
      </ToggleButton>
      <Button startIcon={<ShareIcon />}>Share</Button>
      <Button startIcon={<DownloadIcon />}>Export</Button>
    </ButtonGroup>
  );
}
