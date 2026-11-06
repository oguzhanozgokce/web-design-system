import {
  ArrowDropDownIcon,
  DescriptionIcon,
  DownloadIcon,
  TableRowsIcon,
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
        <MenuItem startIcon={<TableRowsIcon />} description="Opens in Excel, Numbers and Sheets">
          CSV
        </MenuItem>
        <MenuItem startIcon={<TableRowsIcon />} description="Keeps formulas and currency formats">
          Excel workbook
        </MenuItem>
        <MenuItem startIcon={<DescriptionIcon />} description="Print-ready, with your logo">
          PDF statement
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
