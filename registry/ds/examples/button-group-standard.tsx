import { DeleteIcon, EditIcon, ShareIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupStandard() {
  return (
    <ButtonGroup aria-label="Actions" size="sm" buttonVariant="outlined" className="justify-center">
      <Button startIcon={<EditIcon />}>Edit</Button>
      <Button startIcon={<ShareIcon />}>Share</Button>
      <Button startIcon={<DeleteIcon />} tone="destructive">
        Delete
      </Button>
    </ButtonGroup>
  );
}
