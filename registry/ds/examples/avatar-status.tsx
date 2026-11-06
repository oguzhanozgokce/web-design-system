import { Avatar } from '@/registry/ds/ui/avatar';

export default function AvatarStatus() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Avatar name="Ayşe Demir" status="online" />
      <Avatar name="Mehmet Kaya" status="away" />
      <Avatar name="Elif Şahin" status="busy" />
      <Avatar name="Can Yılmaz" status="offline" />
      <Avatar name="Harbor Logistics" shape="rounded" status="online" />
    </div>
  );
}
