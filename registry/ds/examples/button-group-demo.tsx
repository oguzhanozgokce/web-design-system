import { CheckIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupDemo() {
  return (
    <ButtonGroup aria-label="Invoice INV-2048" className="justify-center">
      <Button startIcon={<CheckIcon />}>Approve</Button>
      <Button variant="tonal">Request changes</Button>
      <Button variant="outlined" tone="destructive">
        Reject
      </Button>
    </ButtonGroup>
  );
}
