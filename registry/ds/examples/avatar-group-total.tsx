import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';

export default function AvatarGroupTotal() {
  return (
    <div className="flex items-center gap-3">
      <AvatarGroup aria-label="Members of #finance" total={1284} max={3}>
        <Avatar name="Ayşe Demir" />
        <Avatar name="Mehmet Kaya" />
        <Avatar name="Elif Şahin" />
      </AvatarGroup>
      <bdi className="text-body-md text-on-surface-variant">#finance</bdi>
    </div>
  );
}
