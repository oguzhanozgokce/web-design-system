import { LockIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTrigger } from '@/registry/ds/ui/dialog';

export default function DialogRequired() {
  return (
    <DialogTrigger>
      <Button variant="outline" startIcon={<LockIcon />}>
        Simulate expired session
      </Button>
      <Dialog size="sm" isDismissable={false} isKeyboardDismissDisabled>
        <DialogHeader
          icon={<LockIcon />}
          iconTone="warning"
          title="Your session expired"
          description="For your security, you are signed out after 30 minutes without activity. Unsaved changes are kept as a draft."
        />
        <DialogFooter>
          <Button slot="close">Sign in again</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
