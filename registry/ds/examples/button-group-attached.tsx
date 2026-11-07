import { ChevronLeftIcon, ChevronRightIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupAttached() {
  return (
    <ButtonGroup aria-label="Calendar" buttonVariant="soft" size="sm">
      <Button startIcon={<ChevronLeftIcon className="rtl:-scale-x-100" />}>Previous</Button>
      <Button>Today</Button>
      <Button endIcon={<ChevronRightIcon className="rtl:-scale-x-100" />}>Next</Button>
    </ButtonGroup>
  );
}
