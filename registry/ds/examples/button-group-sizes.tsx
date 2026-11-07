import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ButtonGroup
          key={size}
          aria-label={`History, size ${size}`}
          buttonVariant="soft"
          size={size}
        >
          <Button>Undo</Button>
          <Button>Redo</Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
