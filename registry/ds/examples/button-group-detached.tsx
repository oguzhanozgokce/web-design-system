import { DeleteIcon, EditIcon, ShareIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupDetached() {
  return (
    <ButtonGroup
      aria-label="Actions"
      variant="detached"
      size="sm"
      buttonVariant="outline"
      className="justify-center"
    >
      <Button startIcon={<EditIcon />}>Edit</Button>
      <Button startIcon={<ShareIcon />}>Share</Button>
      <Button startIcon={<DeleteIcon />} tone="error">
        Delete
      </Button>
    </ButtonGroup>
  );
}
