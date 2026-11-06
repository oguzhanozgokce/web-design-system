import {
  GroupIcon,
  MailIcon,
  MoreVerticalIcon,
  PersonIcon,
  VerifiedIcon,
} from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from '@/registry/ds/ui/menu';

export default function MenuDisabled() {
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-lg bg-surface-container-low py-2 ps-4 pe-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-title-sm text-on-surface">Mert Kaya</p>
        <p className="truncate text-body-sm text-on-surface-variant">Editor, joined 3 Nov</p>
      </div>
      <MenuTrigger>
        <IconButton aria-label="Actions for Mert Kaya" icon={<MoreVerticalIcon />} />
        <Menu placement="bottom end" disabledKeys={['resend', 'owner']}>
          <MenuItem id="role" startIcon={<GroupIcon />}>
            Change role
          </MenuItem>
          <MenuItem id="resend" startIcon={<MailIcon />} description="Invite accepted on 3 Nov">
            Resend invite
          </MenuItem>
          <MenuItem
            id="owner"
            startIcon={<VerifiedIcon />}
            description="Only the owner can do this"
          >
            Make owner
          </MenuItem>
          <MenuSeparator />
          <MenuItem id="remove" startIcon={<PersonIcon />} tone="destructive">
            Remove
          </MenuItem>
        </Menu>
      </MenuTrigger>
    </div>
  );
}
