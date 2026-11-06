import { Avatar } from '@/registry/ds/ui/avatar';

export default function AvatarShapes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex items-center gap-3">
        <Avatar name="Mateo García" />
        <Avatar name="Layla Haddad" />
        <Avatar name="Chen Wei" />
      </div>
      <div className="flex items-center gap-3">
        <Avatar name="Design team" shape="rounded" />
        <Avatar
          name="Travel album"
          shape="rounded"
          src="https://picsum.photos/seed/travel-album/80"
        />
        <Avatar name="Book club" shape="rounded" />
      </div>
    </div>
  );
}
