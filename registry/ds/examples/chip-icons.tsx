import { DescriptionIcon, FolderIcon, ImageIcon, LinkIcon } from '@/registry/ds/lib/icons';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

export default function ChipIcons() {
  return (
    <ChipGroup label="Attachments" selectionMode="multiple" defaultSelectedKeys={['documents']}>
      <Chip id="documents" startIcon={<DescriptionIcon />}>
        Documents
      </Chip>
      <Chip id="images" startIcon={<ImageIcon />}>
        Images
      </Chip>
      <Chip id="links" startIcon={<LinkIcon />}>
        Links
      </Chip>
      <Chip id="folders" startIcon={<FolderIcon />}>
        Folders
      </Chip>
    </ChipGroup>
  );
}
