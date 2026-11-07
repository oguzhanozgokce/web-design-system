'use client';

import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const toasterId = 'toast-title';

export default function ToastTitle() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="soft"
        onPress={() => {
          toast.success('Ayşe Demir can now manage members and settings.', {
            toasterId,
            title: 'Role updated',
            description: 'The change applies from her next sign-in.',
          });
        }}
      >
        Make admin
      </Button>
      <Button
        variant="outline"
        onPress={() => {
          toast.error('photo.jpg is larger than the 20 MB limit.', {
            toasterId,
            title: 'Upload failed',
            action: { label: 'Choose another', onAction: () => {} },
          });
        }}
      >
        Upload photo
      </Button>
      <Toaster toasterId={toasterId} />
    </div>
  );
}
