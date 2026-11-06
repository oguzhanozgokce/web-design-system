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
      <Button variant="text" startIcon={<HelpIcon />} endIcon={<ArrowDropDownIcon />}>
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
          href="https://m3.material.io/components/menus"
          target="_blank"
          rel="noreferrer"
          startIcon={<NorthEastIcon />}
          description="Opens in a new tab"
        >
          Material 3 menu spec
        </MenuItem>
        <MenuItem href="mailto:support@example.com" startIcon={<MailIcon />}>
          Email support
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
