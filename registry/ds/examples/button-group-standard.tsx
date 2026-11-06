import { DeleteIcon, EditIcon, MailIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupStandard() {
  return (
    <ButtonGroup
      aria-label="Member Ayşe Demir"
      size="sm"
      buttonVariant="outlined"
      className="justify-center"
    >
      <Button startIcon={<EditIcon />}>Edit role</Button>
      <Button startIcon={<MailIcon />}>Resend invite</Button>
      <Button startIcon={<DeleteIcon />} tone="destructive">
        Remove
      </Button>
    </ButtonGroup>
  );
}
