import { ContentPasteIcon, CopyIcon, UndoIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupDemo() {
  return (
    <ButtonGroup aria-label="Edit" buttonVariant="soft">
      <Button startIcon={<UndoIcon />}>Undo</Button>
      <Button startIcon={<CopyIcon />}>Copy</Button>
      <Button startIcon={<ContentPasteIcon />}>Paste</Button>
    </ButtonGroup>
  );
}
