import { SyncIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTrigger } from '@/registry/ds/ui/dialog';

export default function DialogIcon() {
  return (
    <DialogTrigger>
      <Button variant="soft" startIcon={<SyncIcon />}>
        Sync paused
      </Button>
      <Dialog size="sm">
        <DialogHeader
          icon={<SyncIcon />}
          title="Resume sync?"
          description="Files you changed while sync was paused upload as soon as it resumes."
        />
        <DialogFooter>
          <Button slot="close" variant="soft">
            Later
          </Button>
          <Button slot="close">Resume</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
