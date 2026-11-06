'use client';

import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const toasterId = 'toast-title';

export default function ToastTitle() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="tonal"
        onPress={() => {
          toast.success('Ayşe Demir can now approve invoices up to the team limit.', {
            toasterId,
            title: 'Role updated',
            description: 'The change applies from her next sign-in.',
          });
        }}
      >
        Make approver
      </Button>
      <Button
        variant="outlined"
        tone="destructive"
        onPress={() => {
          toast.error('Card ending 4242 was declined. Update it to keep the Team plan active.', {
            toasterId,
            title: 'Payment failed',
            action: { label: 'Update card', onAction: () => {} },
          });
        }}
      >
        Renew plan
      </Button>
      <Toaster toasterId={toasterId} />
    </div>
  );
}
