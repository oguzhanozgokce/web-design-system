import { Badge } from '@/registry/ds/ui/badge';
import { Button } from '@/registry/ds/ui/button';

export default function BadgeLabel() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="tonal"
        endIcon={<Badge count={7} tone="primary" label="{count} waiting for your review" />}
      >
        Requests
      </Button>
      <Button variant="outlined" endIcon={<Badge count={2} label="{count} failed uploads" />}>
        Uploads
      </Button>
    </div>
  );
}
