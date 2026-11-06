import {
  CopyIcon,
  EditIcon,
  FolderIcon,
  LinkIcon,
  MailIcon,
  MoreHorizontalIcon,
} from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';
import {
  Menu,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from '@/registry/ds/ui/menu';

export default function MenuSections() {
  return (
    <MenuTrigger>
      <IconButton aria-label="More actions" variant="outlined" icon={<MoreHorizontalIcon />} />
      <Menu>
        <MenuSection>
          <MenuHeader>Edit</MenuHeader>
          <MenuItem startIcon={<EditIcon />}>Rename</MenuItem>
          <MenuItem startIcon={<CopyIcon />}>Duplicate</MenuItem>
          <MenuItem startIcon={<FolderIcon />}>Move</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection>
          <MenuHeader>Share</MenuHeader>
          <MenuItem startIcon={<LinkIcon />}>Copy link</MenuItem>
          <MenuItem startIcon={<MailIcon />}>Send by email</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
}
