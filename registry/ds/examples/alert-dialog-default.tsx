'use client';

import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogDefault() {
  return (
    <DialogTrigger>
      <Button>Publish</Button>
      <AlertDialog
        title="Publish this post?"
        description="Everyone who follows you is notified and can see it right away."
        confirmLabel="Publish"
        cancelLabel="Not yet"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 800))}
      />
    </DialogTrigger>
  );
}
