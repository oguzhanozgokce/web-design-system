'use client';

import { DeleteIcon } from '@/registry/ds/lib/icons';
import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogTypeToConfirm() {
  return (
    <DialogTrigger>
      <Button tone="destructive" startIcon={<DeleteIcon />}>
        Delete account
      </Button>
      <AlertDialog
        tone="destructive"
        icon={<DeleteIcon />}
        title="Delete your account?"
        description="Your profile, files and settings are deleted permanently."
        requireConfirmation="DELETE"
        confirmLabel="Delete account"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
      />
    </DialogTrigger>
  );
}
