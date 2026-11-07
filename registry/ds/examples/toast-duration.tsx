'use client';

import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const toasterId = 'toast-duration';

export default function ToastDuration() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="soft"
        onPress={() => {
          toast('Your export is being prepared. We will email you when it is ready.', {
            toasterId,
            duration: Infinity,
          });
        }}
      >
        Keep open
      </Button>
      <Button
        variant="outline"
        onPress={() => {
          toast('Share link copied', { toasterId, duration: 2000 });
        }}
      >
        Two seconds
      </Button>
      <Button variant="ghost" onPress={() => toast.dismiss()}>
        Dismiss all
      </Button>
      <Toaster toasterId={toasterId} />
    </div>
  );
}
