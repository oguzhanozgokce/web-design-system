import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupButtonVariants() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['filled', 'tonal', 'outlined', 'elevated'] as const).map((buttonVariant) => (
        <ButtonGroup
          key={buttonVariant}
          aria-label={`Export, ${buttonVariant}`}
          variant="connected"
          buttonVariant={buttonVariant}
        >
          <Button>CSV</Button>
          <Button>PDF</Button>
          <Button>XLSX</Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
