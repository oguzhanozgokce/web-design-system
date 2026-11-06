'use client';

import { DownloadIcon, SyncIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const toasterId = 'toast-promise';

function exportOrders() {
  return new Promise<string>((resolve) => setTimeout(() => resolve('orders-november.csv'), 1800));
}

function syncBankFeed() {
  return new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('The bank did not answer within 30 seconds.')), 1800),
  );
}

function startSync() {
  toast.promise(syncBankFeed, {
    toasterId,
    loading: 'Syncing bank feed',
    success: 'Bank feed synced',
    error: (reason) => ({
      message: 'Bank feed could not sync',
      description: reason instanceof Error ? reason.message : undefined,
      action: { label: 'Retry', onAction: startSync },
    }),
  });
}

export default function ToastPromise() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        startIcon={<DownloadIcon />}
        onPress={() => {
          toast.promise(exportOrders(), {
            toasterId,
            loading: 'Exporting 240 orders',
            success: (file) => ({ message: 'Export ready', description: file }),
            error: 'Export failed',
          });
        }}
      >
        Export orders
      </Button>
      <Button variant="outlined" startIcon={<SyncIcon />} onPress={startSync}>
        Sync bank feed
      </Button>
      <Toaster toasterId={toasterId} />
    </div>
  );
}
