'use client';

import { UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const toasterId = 'toast-update';
const receipts = 12;

function uploadReceipts() {
  const id = toast.loading(`Uploading receipts: 0 of ${receipts}`, { toasterId });
  let uploaded = 0;
  const timer = setInterval(() => {
    uploaded += 1;
    const isDone = uploaded === receipts;
    const isOpen = toast.update(
      id,
      isDone
        ? {
            message: `${receipts} receipts uploaded`,
            description: 'They are ready to match in the ledger.',
            tone: 'success',
            isLoading: false,
          }
        : { message: `Uploading receipts: ${uploaded} of ${receipts}` },
    );
    if (isDone || !isOpen) clearInterval(timer);
  }, 250);
}

export default function ToastUpdate() {
  return (
    <>
      <Button variant="tonal" startIcon={<UploadIcon />} onPress={uploadReceipts}>
        Upload receipts
      </Button>
      <Toaster toasterId={toasterId} />
    </>
  );
}
