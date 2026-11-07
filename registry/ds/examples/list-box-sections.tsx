import { FolderIcon, GroupIcon } from '@/registry/ds/lib/icons';
import { ListBox, ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';

export default function ListBoxSections() {
  return (
    <ListBox
      aria-label="Move to"
      selectionMode="single"
      variant="outline"
      className="w-full max-w-xs"
    >
      <ListBoxSection title="Recent">
        <ListBoxItem id="photos" startIcon={<FolderIcon />}>
          Photos
        </ListBoxItem>
        <ListBoxItem id="documents" startIcon={<FolderIcon />}>
          Documents
        </ListBoxItem>
      </ListBoxSection>
      <ListBoxSection title="Shared with you">
        <ListBoxItem id="family" startIcon={<GroupIcon />} description="Amara Okafor">
          Family
        </ListBoxItem>
        <ListBoxItem id="book-club" startIcon={<GroupIcon />} description="Lucas Martin">
          Book club
        </ListBoxItem>
      </ListBoxSection>
    </ListBox>
  );
}
