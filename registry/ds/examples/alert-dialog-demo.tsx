'use client';

import { DeleteIcon } from '@/registry/ds/lib/icons';
import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogDemo() {
  return (
    <DialogTrigger>
      <Button tone="destructive" variant="tonal" startIcon={<DeleteIcon />}>
        Delete ledger
      </Button>
      <AlertDialog
        tone="destructive"
        title="Delete “Operating account”?"
        description="All 1,284 entries and their attachments are removed for everyone in the workspace. This cannot be undone."
        confirmLabel="Delete ledger"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
      />
    </DialogTrigger>
  );
}
