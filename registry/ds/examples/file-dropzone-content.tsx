'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'react-aria-components';
import { CloseIcon } from '@/registry/ds/lib/icons';
import { formatFileSize } from '@/registry/ds/lib/files';
import { Avatar } from '@/registry/ds/ui/avatar';
import { FileDropzone } from '@/registry/ds/ui/file-dropzone';
import { IconButton } from '@/registry/ds/ui/icon-button';

interface Photo {
  file: File;
  url: string;
}

export default function FileDropzoneContent() {
  const { locale } = useLocale();
  const [photo, setPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  return (
    <FileDropzone
      className="max-w-sm"
      label="Profile photo"
      acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp']}
      maxSize={2_000_000}
      onSelect={([file]) => setPhoto({ file, url: URL.createObjectURL(file) })}
    >
      {photo ? (
        <div className="flex items-center gap-3">
          <Avatar size="lg" src={photo.url} name={photo.file.name} alt="" />
          <div className="flex w-36 min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{photo.file.name}</span>
            <span className="text-xs text-on-surface-variant">
              {formatFileSize(photo.file.size, locale)}
            </span>
          </div>
          <IconButton
            size="sm"
            variant="ghost"
            icon={<CloseIcon />}
            aria-label={`Remove ${photo.file.name}`}
            onPress={() => setPhoto(null)}
          />
        </div>
      ) : null}
    </FileDropzone>
  );
}
