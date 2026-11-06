import { FilterIcon, SortIcon, ViewColumnIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonShapes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex gap-2">
        <IconButton variant="tonal" aria-label="Filter rows" icon={<FilterIcon />} />
        <IconButton variant="tonal" aria-label="Sort rows" icon={<SortIcon />} />
        <IconButton variant="tonal" aria-label="Choose columns" icon={<ViewColumnIcon />} />
      </div>
      <div className="flex gap-2">
        <IconButton shape="square" variant="tonal" aria-label="Filter rows" icon={<FilterIcon />} />
        <IconButton shape="square" variant="tonal" aria-label="Sort rows" icon={<SortIcon />} />
        <IconButton
          shape="square"
          variant="tonal"
          aria-label="Choose columns"
          icon={<ViewColumnIcon />}
        />
      </div>
    </div>
  );
}
