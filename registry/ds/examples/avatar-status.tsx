import { Avatar } from '@/registry/ds/ui/avatar';

export default function AvatarStatus() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Avatar name="Amara Okafor" status="online" />
      <Avatar name="Kenji Watanabe" status="away" />
      <Avatar name="Sofia Rossi" status="busy" />
      <Avatar name="Lars Eriksson" status="offline" />
      <Avatar name="Design team" shape="rounded" status="online" />
    </div>
  );
}
