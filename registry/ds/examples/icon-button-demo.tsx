import { DownloadIcon, EditIcon, MoreVerticalIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonDemo() {
  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-lg bg-surface-container-low py-3 ps-4 pe-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-title-sm text-on-surface">Invoice INV-2041</p>
        <p className="truncate text-body-sm text-on-surface-variant">
          Northwind Traders, due 14 Nov
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <IconButton aria-label="Edit invoice" icon={<EditIcon />} />
        <IconButton aria-label="Download PDF" icon={<DownloadIcon />} />
        <IconButton aria-label="More actions" icon={<MoreVerticalIcon />} />
      </div>
    </div>
  );
}
