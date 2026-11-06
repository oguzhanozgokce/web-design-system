import { Avatar } from '@/registry/ds/ui/avatar';

export default function AvatarShapes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex items-center gap-3">
        <Avatar name="Burak Öztürk" />
        <Avatar name="Zeynep Arslan" />
        <Avatar name="Can Yılmaz" />
      </div>
      <div className="flex items-center gap-3">
        <Avatar name="Northwind Studio" shape="rounded" />
        <Avatar
          name="Harbor Logistics"
          shape="rounded"
          src="https://picsum.photos/seed/harbor-logistics/80"
        />
        <Avatar name="Atlas Payroll" shape="rounded" />
      </div>
    </div>
  );
}
