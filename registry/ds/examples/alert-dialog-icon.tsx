'use client';

import { LogoutIcon } from '@/registry/ds/lib/icons';
import { AlertDialog } from '@/registry/ds/ui/alert-dialog';
import { Button } from '@/registry/ds/ui/button';
import { DialogTrigger } from '@/registry/ds/ui/dialog';

export default function AlertDialogIcon() {
  return (
    <DialogTrigger>
      <Button variant="outline" startIcon={<LogoutIcon />}>
        Sign out everywhere
      </Button>
      <AlertDialog
        icon={<LogoutIcon />}
        title="Sign out of all devices?"
        description="You stay signed in here. Phones, tablets and other browsers need your password again."
        confirmLabel="Sign out"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1000))}
      />
    </DialogTrigger>
  );
}
