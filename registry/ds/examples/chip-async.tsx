'use client';

import { useState } from 'react';
import { SendIcon } from '@/registry/ds/lib/icons';
import { AssistChip } from '@/registry/ds/ui/chip';

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 1500));
}

export default function ChipAsync() {
  const [status, setStatus] = useState('Nothing sent yet');

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <AssistChip
          startIcon={<SendIcon className="rtl:-scale-x-100" />}
          onPress={async () => {
            await wait();
            setStatus('Message sent');
          }}
        >
          Send message
        </AssistChip>
        <AssistChip
          onPress={async () => {
            await wait();
            setStatus('Reminder set');
          }}
        >
          Remind me tomorrow
        </AssistChip>
      </div>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
