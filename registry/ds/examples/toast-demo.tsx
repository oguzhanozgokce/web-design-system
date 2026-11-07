'use client';

import { useState } from 'react';
import { SendIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const recipients = ['Alex', 'Jonas', 'Priya', 'Lucía'];

export default function ToastDemo() {
  const [sent, setSent] = useState(0);

  return (
    <>
      <Button
        startIcon={<SendIcon className="rtl:-scale-x-100" />}
        onPress={() => {
          toast(`Message sent to ${recipients[sent % recipients.length]}`, {
            toasterId: 'toast-demo',
          });
          setSent((count) => count + 1);
        }}
      >
        Send message
      </Button>
      <Toaster toasterId="toast-demo" />
    </>
  );
}
