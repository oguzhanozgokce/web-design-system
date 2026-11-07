import { ArchiveIcon, DeleteIcon, DownloadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ButtonGroup } from '@/registry/ds/ui/button-group';

export default function ButtonGroupDisabled() {
  return (
    <div className="flex flex-col items-center gap-3">
      <ButtonGroup
        aria-label="Bulk actions"
        variant="detached"
        buttonVariant="soft"
        size="sm"
        isDisabled
        className="justify-center"
      >
        <Button startIcon={<DownloadIcon />}>Download</Button>
        <Button startIcon={<ArchiveIcon />}>Archive</Button>
        <Button startIcon={<DeleteIcon />} tone="error">
          Delete
        </Button>
      </ButtonGroup>
      <p className="text-xs text-on-surface-variant">Select files to use bulk actions.</p>
    </div>
  );
}
