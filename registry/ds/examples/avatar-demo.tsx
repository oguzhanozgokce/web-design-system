import { Avatar } from '@/registry/ds/ui/avatar';

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar name="Amara Okafor" size="lg" status="online" />
      <Avatar
        name="Travel album"
        shape="rounded"
        size="lg"
        src="https://picsum.photos/seed/travel-album/112"
      />
      <Avatar alt="Unassigned" size="lg" />
    </div>
  );
}
