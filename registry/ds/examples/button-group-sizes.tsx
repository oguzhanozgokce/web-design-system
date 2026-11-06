import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <ButtonGroup
          key={size}
          aria-label={`History, size ${size}`}
          variant="connected"
          buttonVariant="tonal"
          size={size}
        >
          <Button>Undo</Button>
          <Button>Redo</Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
