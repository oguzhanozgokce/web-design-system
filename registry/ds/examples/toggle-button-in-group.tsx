import { DownloadIcon, ShareIcon, StarFilledIcon, StarIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonInGroup() {
  return (
    <ButtonGroup
      aria-label="Actions"
      variant="detached"
      buttonVariant="soft"
      size="sm"
      className="justify-center"
    >
      <ToggleButton startIcon={<StarIcon />} selectedIcon={<StarFilledIcon />}>
        Star
      </ToggleButton>
      <Button startIcon={<ShareIcon />}>Share</Button>
      <Button startIcon={<DownloadIcon />}>Download</Button>
    </ButtonGroup>
  );
}
