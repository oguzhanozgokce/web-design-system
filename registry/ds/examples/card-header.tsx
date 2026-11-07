import { Avatar } from '@/registry/ds/ui/avatar';
import { Button } from '@/registry/ds/ui/button';
import { Card, CardContent, CardHeader } from '@/registry/ds/ui/card';

export default function CardHeaderExample() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader
        leading={<Avatar name="Lena Schmidt" alt="" />}
        title="Lena Schmidt"
        description="Designer"
        action={
          <Button variant="soft" size="sm">
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
