import { FileDropzone } from '@/registry/ds/ui/file-dropzone';

export default function FileDropzoneVariants() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <FileDropzone variant="soft" acceptedFileTypes={['.pdf']} />
      <FileDropzone variant="outline" acceptedFileTypes={['.pdf']} />
    </div>
  );
}
