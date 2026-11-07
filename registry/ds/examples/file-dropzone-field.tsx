'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { FileDropzone } from '@/registry/ds/ui/file-dropzone';

export default function FileDropzoneField() {
  const [cover, setCover] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <FileDropzone
        size="sm"
        label="Cover image"
        acceptedFileTypes={['image/*']}
        maxSize={5_000_000}
        description={cover?.name}
        isInvalid={submitted && cover == null}
        errorMessage="Add a cover image to publish the project"
        onSelect={([file]) => setCover(file)}
      />
      <Button onPress={() => setSubmitted(true)}>Publish</Button>
    </div>
  );
}
