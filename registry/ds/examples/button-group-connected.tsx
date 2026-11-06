import { ChevronLeftIcon, ChevronRightIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupConnected() {
  return (
    <ButtonGroup aria-label="Calendar" variant="connected" buttonVariant="tonal" size="sm">
      <Button startIcon={<ChevronLeftIcon className="rtl:-scale-x-100" />}>Previous</Button>
      <Button>Today</Button>
      <Button endIcon={<ChevronRightIcon className="rtl:-scale-x-100" />}>Next</Button>
    </ButtonGroup>
  );
}
