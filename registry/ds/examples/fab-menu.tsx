'use client';

import { useState } from 'react';
import { CloudUploadIcon, DescriptionIcon, GroupIcon, SendIcon } from '@/registry/ds/lib/icons';
import { FabMenu, FabMenuItem } from '@/registry/ds/ui/fab';

const labels: Record<string, string> = {
  invoice: 'New invoice',
  receipt: 'Upload receipt',
  transfer: 'Send transfer',
  client: 'Add client',
};

export default function FabMenuExample() {
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="relative flex h-96 w-full max-w-sm flex-col justify-between rounded-lg bg-surface-container-low p-4">
      <p className="text-body-md text-on-surface-variant" aria-live="polite">
        {last ? `Started: ${labels[last]}` : 'Nothing created yet'}
      </p>
      <FabMenu aria-label="Create" className="self-end" onAction={(key) => setLast(String(key))}>
        <FabMenuItem id="invoice" icon={<DescriptionIcon />}>
          {labels.invoice}
        </FabMenuItem>
        <FabMenuItem id="receipt" icon={<CloudUploadIcon />}>
          {labels.receipt}
        </FabMenuItem>
        <FabMenuItem id="transfer" icon={<SendIcon className="rtl:-scale-x-100" />}>
          {labels.transfer}
        </FabMenuItem>
        <FabMenuItem id="client" icon={<GroupIcon />}>
          {labels.client}
        </FabMenuItem>
      </FabMenu>
    </div>
  );
}
