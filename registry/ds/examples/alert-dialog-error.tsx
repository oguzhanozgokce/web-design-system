'use client';

import { useRef } from 'react';
import { ArchiveIcon } from '@/registry/ds/lib/icons';
import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogError() {
  const attempts = useRef(0);

  return (
    <DialogTrigger onOpenChange={(isOpen) => isOpen && (attempts.current = 0)}>
      <Button variant="tonal" startIcon={<ArchiveIcon />}>
        Archive workspace
      </Button>
      <AlertDialog
        tone="destructive"
        title="Archive “Acme Finance”?"
        description="Members lose access and scheduled exports stop. You can restore it within 30 days."
        confirmLabel="Archive"
        onConfirm={async () => {
          attempts.current += 1;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (attempts.current === 1) {
            throw new Error('2 invoices are still unpaid. Settle them, then try again.');
          }
        }}
      />
    </DialogTrigger>
  );
}
