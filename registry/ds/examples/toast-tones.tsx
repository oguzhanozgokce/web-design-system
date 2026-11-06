'use client';

import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast, type ToastTone } from '@/registry/ds/ui/toast';

const toasterId = 'toast-tones';

const samples: { tone: ToastTone; label: string; message: string }[] = [
  { tone: 'default', label: 'Default', message: 'Draft saved' },
  { tone: 'info', label: 'Info', message: 'Payout to Globex is scheduled for Friday' },
  { tone: 'success', label: 'Success', message: 'Payment from Acme Corp received' },
  { tone: 'warning', label: 'Warning', message: 'Card ending 4242 expires in 7 days' },
  { tone: 'error', label: 'Error', message: 'Bank feed could not sync' },
];

export default function ToastTones() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {samples.map(({ tone, label, message }) => (
        <Button
          key={tone}
          variant="outlined"
          onPress={() => {
            toast(message, { tone, toasterId });
          }}
        >
          {label}
        </Button>
      ))}
      <Toaster toasterId={toasterId} />
    </div>
  );
}
