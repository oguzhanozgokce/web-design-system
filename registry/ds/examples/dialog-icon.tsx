import { SyncIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, DialogFooter, DialogHeader, DialogTrigger } from '@/registry/ds/ui/dialog';

export default function DialogIcon() {
  return (
    <DialogTrigger>
      <Button variant="tonal" startIcon={<SyncIcon />}>
        Bank sync paused
      </Button>
      <Dialog size="sm">
        <DialogHeader
          icon={<SyncIcon />}
          title="Reconnect Northwind Bank?"
          description="Your bank asks you to sign in again every 90 days. Until you do, new transactions stop importing."
        />
        <DialogFooter>
          <Button slot="close" variant="text">
            Later
          </Button>
          <Button slot="close">Reconnect</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
