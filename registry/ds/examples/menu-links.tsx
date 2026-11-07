import {
  ArrowDropDownIcon,
  DescriptionIcon,
  HelpIcon,
  MailIcon,
  NorthEastIcon,
} from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from '@/registry/ds/ui/menu';

export default function MenuLinks() {
  return (
    <MenuTrigger>
      <Button variant="ghost" startIcon={<HelpIcon />} endIcon={<ArrowDropDownIcon />}>
        Help
      </Button>
      <Menu>
        <MenuItem href="#installation" startIcon={<DescriptionIcon />}>
          Install the menu
        </MenuItem>
        <MenuItem href="#accessibility" startIcon={<DescriptionIcon />}>
          Keyboard and screen readers
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          href="https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/"
          target="_blank"
          rel="noreferrer"
          startIcon={<NorthEastIcon />}
          description="Opens in a new tab"
        >
          Menu button pattern
        </MenuItem>
        <MenuItem href="mailto:support@example.com" startIcon={<MailIcon />}>
          Email support
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
