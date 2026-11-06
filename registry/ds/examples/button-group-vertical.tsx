import { ArrowDownwardIcon, ArrowUpwardIcon, FirstPageIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupVertical() {
  return (
    <ButtonGroup
      aria-label="Reorder column"
      variant="connected"
      orientation="vertical"
      buttonVariant="outlined"
    >
      <Button startIcon={<FirstPageIcon className="rotate-90" />}>Move to top</Button>
      <Button startIcon={<ArrowUpwardIcon />}>Move up</Button>
      <Button startIcon={<ArrowDownwardIcon />}>Move down</Button>
    </ButtonGroup>
  );
}
