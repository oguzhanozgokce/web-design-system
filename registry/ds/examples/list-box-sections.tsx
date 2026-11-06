import { FolderIcon, GroupIcon } from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';

export default function ListBoxSections() {
  return (
    <ListBox
      aria-label="Move receipt to"
      selectionMode="single"
      variant="outlined"
      className="w-full max-w-xs"
    >
      <ListBoxSection title="Recent">
        <ListBoxItem id="receipts-2026" startIcon={<FolderIcon />}>
          Receipts 2026
        </ListBoxItem>
        <ListBoxItem id="travel" startIcon={<FolderIcon />}>
          Travel
        </ListBoxItem>
      </ListBoxSection>
      <ListBoxSection title="Shared with you">
        <ListBoxItem id="household" startIcon={<GroupIcon />} description="Ayşe Demir">
          Household
        </ListBoxItem>
        <ListBoxItem id="office" startIcon={<GroupIcon />} description="Northwind finance team">
          Office lunches
        </ListBoxItem>
      </ListBoxSection>
    </ListBox>
  );
}
