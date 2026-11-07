import { FileDropzone } from '@/registry/ds/ui/file-dropzone';

export default function FileDropzoneDisabled() {
  return (
    <FileDropzone
      className="max-w-sm"
      isDisabled
      description="Storage is full. Free up space to add more files."
    />
  );
}
