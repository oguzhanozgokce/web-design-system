'use client';

import { useState } from 'react';
import { SendIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const customers = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Health'];

export default function ToastDemo() {
  const [sent, setSent] = useState(0);

  return (
    <>
      <Button
        startIcon={<SendIcon className="rtl:-scale-x-100" />}
        onPress={() => {
          toast(`Invoice INV-${2048 + sent} sent to ${customers[sent % customers.length]}`, {
            toasterId: 'toast-demo',
          });
          setSent((count) => count + 1);
        }}
      >
        Send invoice
      </Button>
      <Toaster toasterId="toast-demo" />
    </>
  );
}
