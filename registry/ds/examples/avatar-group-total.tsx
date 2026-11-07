import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';

export default function AvatarGroupTotal() {
  return (
    <div className="flex items-center gap-3">
      <AvatarGroup aria-label="Members of #general" total={1284} max={3}>
        <Avatar name="Layla Haddad" />
        <Avatar name="Chen Wei" />
        <Avatar name="Ana Silva" />
      </AvatarGroup>
      <bdi className="text-sm text-on-surface-variant">#general</bdi>
    </div>
  );
}
