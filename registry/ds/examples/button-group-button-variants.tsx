import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupButtonVariants() {
  return (
    <div className="flex flex-col items-center gap-4">
      {(['solid', 'soft', 'outline', 'ghost'] as const).map((buttonVariant) => (
        <ButtonGroup
          key={buttonVariant}
          aria-label={`Period, ${buttonVariant}`}
          buttonVariant={buttonVariant}
        >
          <Button>Day</Button>
          <Button>Week</Button>
          <Button>Month</Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
