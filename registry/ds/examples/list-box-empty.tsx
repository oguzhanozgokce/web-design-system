import { ArchiveIcon } from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem, ListBoxStatus } from '@/registry/ds/ui/list-box';

const archived: { id: string; name: string }[] = [];

export default function ListBoxEmpty() {
  return (
    <ListBox
      aria-label="Archive"
      items={archived}
      variant="outlined"
      className="w-full max-w-xs"
      renderEmptyState={() => (
        <ListBoxStatus icon={<ArchiveIcon />}>Archived items show up here</ListBoxStatus>
      )}
    >
      {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
    </ListBox>
  );
}
