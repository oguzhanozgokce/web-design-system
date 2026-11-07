import { FileDropzone } from '@/registry/ds/ui/file-dropzone';

export default function FileDropzoneSizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <FileDropzone size="sm" maxSize={2_000_000} />
      <FileDropzone size="md" maxSize={10_000_000} />
      <FileDropzone size="lg" allowsMultiple maxSize={50_000_000} />
    </div>
  );
}
