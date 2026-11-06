import {
  ArrowDropDownIcon,
  DescriptionIcon,
  DownloadIcon,
  LanguageIcon,
  ListIcon,
} from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Menu, MenuItem, MenuTrigger } from '@/registry/ds/ui/menu';

export default function MenuDescriptions() {
  return (
    <MenuTrigger>
      <Button variant="tonal" startIcon={<DownloadIcon />} endIcon={<ArrowDropDownIcon />}>
        Export
      </Button>
      <Menu>
        <MenuItem startIcon={<DescriptionIcon />} description="Best for printing and sharing">
          PDF
        </MenuItem>
        <MenuItem startIcon={<LanguageIcon />} description="Opens in any browser">
          Web page
        </MenuItem>
        <MenuItem startIcon={<ListIcon />} description="Text only, without formatting">
          Plain text
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
