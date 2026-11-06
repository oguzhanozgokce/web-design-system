import { ArchiveIcon } from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem, ListBoxStatus } from '@/registry/ds/ui/list-box';

const archived: { id: string; name: string }[] = [];

export default function ListBoxEmpty() {
  return (
    <ListBox
      aria-label="Archived ledgers"
      items={archived}
      variant="outlined"
      className="w-full max-w-xs"
      renderEmptyState={() => (
        <ListBoxStatus icon={<ArchiveIcon />}>Archived ledgers show up here</ListBoxStatus>
      )}
    >
      {(ledger) => <ListBoxItem>{ledger.name}</ListBoxItem>}
    </ListBox>
  );
}
