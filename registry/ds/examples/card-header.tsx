import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';

export default function CardHeaderExample() {
  return (
    <Card variant="outlined" className="w-full max-w-md">
      <CardHeader
        leading={
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full bg-secondary-container text-title-sm text-on-secondary-container"
          >
            LS
          </span>
        }
        title="Lena Schmidt"
        description="Designer"
        action={
          <Button variant="tonal" size="sm">
            Follow
          </Button>
        }
      />
      <CardContent className="text-on-surface-variant">
        Designs simple, accessible interfaces and writes about colour and type.
      </CardContent>
    </Card>
  );
}
