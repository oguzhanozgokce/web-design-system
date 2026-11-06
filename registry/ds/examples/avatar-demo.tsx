import { Avatar } from '@/registry/ds/ui/avatar';

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar name="Ayşe Demir" size="lg" status="online" />
      <Avatar
        name="Harbor Logistics"
        shape="rounded"
        size="lg"
        src="https://picsum.photos/seed/harbor-logistics/112"
      />
      <Avatar alt="Unassigned" size="lg" />
    </div>
  );
}
