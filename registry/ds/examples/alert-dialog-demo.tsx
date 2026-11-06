'use client';

import { DeleteIcon } from '@/registry/ds/lib/icons';
import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogDemo() {
  return (
    <DialogTrigger>
      <Button tone="destructive" variant="tonal" startIcon={<DeleteIcon />}>
        Delete file
      </Button>
      <AlertDialog
        tone="destructive"
        title="Delete “Notes.txt”?"
        description="The file is deleted for everyone it is shared with. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
      />
    </DialogTrigger>
  );
}
