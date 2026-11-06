import { FilterIcon, SortIcon, ViewColumnIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonShapes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex gap-2">
        <IconButton variant="tonal" aria-label="Filter" icon={<FilterIcon />} />
        <IconButton variant="tonal" aria-label="Sort" icon={<SortIcon />} />
        <IconButton variant="tonal" aria-label="Columns" icon={<ViewColumnIcon />} />
      </div>
      <div className="flex gap-2">
        <IconButton shape="square" variant="tonal" aria-label="Filter" icon={<FilterIcon />} />
        <IconButton shape="square" variant="tonal" aria-label="Sort" icon={<SortIcon />} />
        <IconButton shape="square" variant="tonal" aria-label="Columns" icon={<ViewColumnIcon />} />
      </div>
    </div>
  );
}
