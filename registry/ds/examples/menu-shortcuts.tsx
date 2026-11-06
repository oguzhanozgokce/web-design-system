import {
  ContentPasteIcon,
  CopyIcon,
  SearchIcon,
  TableRowsIcon,
  UndoIcon,
} from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from '@/registry/ds/ui/menu';

export default function MenuShortcuts() {
  return (
    <MenuTrigger>
      <Button variant="outlined">Edit</Button>
      <Menu>
        <MenuItem startIcon={<UndoIcon className="rtl:-scale-x-100" />} shortcut={['mod', 'Z']}>
          Undo
        </MenuItem>
        <MenuItem
          startIcon={<UndoIcon className="-scale-x-100 rtl:scale-x-100" />}
          shortcut={['mod', 'shift', 'Z']}
        >
          Redo
        </MenuItem>
        <MenuSeparator />
        <MenuItem startIcon={<CopyIcon />} shortcut={['mod', 'C']}>
          Copy amount
        </MenuItem>
        <MenuItem startIcon={<ContentPasteIcon />} shortcut={['mod', 'V']}>
          Paste
        </MenuItem>
        <MenuSeparator />
        <MenuItem startIcon={<SearchIcon />} shortcut={['mod', 'F']}>
          Find in ledger
        </MenuItem>
        <MenuItem startIcon={<TableRowsIcon />} shortcut={['shift', 'space']}>
          Select row
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
