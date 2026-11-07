'use client';

import { UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

const toasterId = 'toast-update';
const photos = 12;

function uploadPhotos() {
  const id = toast.loading(`Uploading photos: 0 of ${photos}`, { toasterId });
  let uploaded = 0;
  const timer = setInterval(() => {
    uploaded += 1;
    const isDone = uploaded === photos;
    const isOpen = toast.update(
      id,
      isDone
        ? {
            message: `${photos} photos uploaded`,
            description: 'They are ready to share.',
            tone: 'success',
            isLoading: false,
          }
        : { message: `Uploading photos: ${uploaded} of ${photos}` },
    );
    if (isDone || !isOpen) clearInterval(timer);
  }, 250);
}

export default function ToastUpdate() {
  return (
    <>
      <Button variant="soft" startIcon={<UploadIcon />} onPress={uploadPhotos}>
        Upload photos
      </Button>
      <Toaster toasterId={toasterId} />
    </>
  );
}
