import { Avatar } from '@/registry/ds/ui/avatar';

export default function AvatarSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} name="Priya Sharma" size={size} status="online" />
      ))}
    </div>
  );
}
