import { AddIcon, FolderIcon, UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

export default function EmptyStateDemo() {
  return (
    <EmptyState
      icon={<FolderIcon />}
      title="No files yet"
      description="Upload files from your device, or create a folder to keep them organised."
      primaryAction={<Button startIcon={<UploadIcon />}>Upload files</Button>}
      secondaryAction={<Button startIcon={<AddIcon />}>New folder</Button>}
    />
  );
}
