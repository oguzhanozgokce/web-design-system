'use client';

import { DownloadIcon, SyncIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const toasterId = 'toast-promise';

function exportPhotos() {
  return new Promise<string>((resolve) => setTimeout(() => resolve('photos.zip'), 1800));
}

function syncFiles() {
  return new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('The server did not answer within 30 seconds.')), 1800),
  );
}

function startSync() {
  toast.promise(syncFiles, {
    toasterId,
    loading: 'Syncing files',
    success: 'Files synced',
    error: (reason) => ({
      message: 'Files could not sync',
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
          toast.promise(exportPhotos(), {
            toasterId,
            loading: 'Exporting 240 photos',
            success: (file) => ({ message: 'Export ready', description: file }),
            error: 'Export failed',
          });
        }}
      >
        Export photos
      </Button>
      <Button variant="outline" startIcon={<SyncIcon />} onPress={startSync}>
        Sync files
      </Button>
      <Toaster toasterId={toasterId} />
    </div>
  );
}
