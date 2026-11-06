'use client';

import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogDefault() {
  return (
    <DialogTrigger>
      <Button>Publish report</Button>
      <AlertDialog
        title="Publish the March report?"
        description="Everyone with access to the Finance workspace is notified and can download it."
        confirmLabel="Publish"
        cancelLabel="Not yet"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 800))}
      />
    </DialogTrigger>
  );
}
