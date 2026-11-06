'use client';

import { DeleteIcon } from '@/registry/ds/lib/icons';
import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogTypeToConfirm() {
  return (
    <DialogTrigger>
      <Button tone="destructive" startIcon={<DeleteIcon />}>
        Delete workspace
      </Button>
      <AlertDialog
        tone="destructive"
        icon={<DeleteIcon />}
        title="Delete “Acme Finance”?"
        description="12 ledgers, 4 members and 3 years of history are deleted permanently."
        requireConfirmation="DELETE"
        confirmLabel="Delete workspace"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
      />
    </DialogTrigger>
  );
}
