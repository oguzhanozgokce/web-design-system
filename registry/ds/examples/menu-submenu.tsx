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
    <div className="flex w-full max-w-sm items-center gap-3 rounded-container border border-outline-subtle bg-surface-raised py-2 ps-4 pe-2">
      <FileIcon className="size-5 shrink-0 text-on-surface-variant" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-on-surface">Notes.txt</span>
      <MenuTrigger>
        <IconButton aria-label="Actions for Notes.txt" icon={<MoreVerticalIcon />} />
        <Menu placement="bottom end">
          <MenuItem startIcon={<EditIcon />}>Rename</MenuItem>
          <SubmenuTrigger>
            <MenuItem startIcon={<FolderIcon />}>Move to</MenuItem>
            <Menu>
              <MenuItem>Documents</MenuItem>
              <MenuItem>Shared with me</MenuItem>
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
              <MenuItem startIcon={<MailIcon />}>Send by email</MenuItem>
            </Menu>
          </SubmenuTrigger>
          <MenuSeparator />
          <MenuItem startIcon={<DeleteIcon />} tone="error">
            Move to trash
          </MenuItem>
        </Menu>
      </MenuTrigger>
    </div>
  );
}
