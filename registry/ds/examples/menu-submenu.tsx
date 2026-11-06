import {
  DeleteIcon,
  EditIcon,
  FileIcon,
  FolderIcon,
  LinkIcon,
  MailIcon,
  MoreVerticalIcon,
  ShareIcon,
} from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger, SubmenuTrigger } from '@/registry/ds/ui/menu';

export default function MenuSubmenu() {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-container-low py-2 ps-4 pe-2">
      <FileIcon className="size-6 shrink-0 text-on-surface-variant" />
      <span className="min-w-0 flex-1 truncate text-body-lg text-on-surface">Q3 payroll.xlsx</span>
      <MenuTrigger>
        <IconButton aria-label="Actions for Q3 payroll.xlsx" icon={<MoreVerticalIcon />} />
        <Menu placement="bottom end">
          <MenuItem startIcon={<EditIcon />}>Rename</MenuItem>
          <SubmenuTrigger>
            <MenuItem startIcon={<FolderIcon />}>Move to</MenuItem>
            <Menu>
              <MenuItem>Payroll</MenuItem>
              <MenuItem>Taxes 2026</MenuItem>
              <SubmenuTrigger>
                <MenuItem>Archive</MenuItem>
                <Menu>
                  <MenuItem>2024</MenuItem>
                  <MenuItem>2025</MenuItem>
                </Menu>
              </SubmenuTrigger>
            </Menu>
          </SubmenuTrigger>
          <SubmenuTrigger>
            <MenuItem startIcon={<ShareIcon />}>Share</MenuItem>
            <Menu>
              <MenuItem startIcon={<LinkIcon />}>Copy link</MenuItem>
              <MenuItem startIcon={<MailIcon />}>Email to accountant</MenuItem>
            </Menu>
          </SubmenuTrigger>
          <MenuSeparator />
          <MenuItem startIcon={<DeleteIcon />} tone="destructive">
            Move to trash
          </MenuItem>
        </Menu>
      </MenuTrigger>
    </div>
  );
}
