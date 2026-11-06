import { DeleteIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';

export default function ButtonDestructive() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button tone="destructive" startIcon={<DeleteIcon />}>
        Delete account
      </Button>
      <Button tone="destructive" variant="tonal">
        Remove member
      </Button>
      <Button tone="destructive" variant="outlined">
        Revoke
      </Button>
      <Button tone="destructive" variant="text">
        Discard
      </Button>
    </div>
  );
}
