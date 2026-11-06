import {
  CopyIcon,
  EditIcon,
  LinkIcon,
  MailIcon,
  MoreHorizontalIcon,
  PersonIcon,
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
      <IconButton
        aria-label="Quote Q-1182 actions"
        variant="outlined"
        icon={<MoreHorizontalIcon />}
      />
      <Menu>
        <MenuSection>
          <MenuHeader>Quote</MenuHeader>
          <MenuItem startIcon={<EditIcon />}>Edit line items</MenuItem>
          <MenuItem startIcon={<CopyIcon />}>Duplicate as invoice</MenuItem>
          <MenuItem startIcon={<PersonIcon />}>Change client</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection>
          <MenuHeader>Share</MenuHeader>
          <MenuItem startIcon={<LinkIcon />}>Copy client link</MenuItem>
          <MenuItem startIcon={<MailIcon />}>Email to Northwind Traders</MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
}
