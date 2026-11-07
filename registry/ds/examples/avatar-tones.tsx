import { Avatar } from '@/registry/ds/ui/avatar';

const members = ['Amara Okafor', 'Kenji Watanabe', 'Sofia Rossi', 'Mateo García'];

const tones = [
  { name: 'You', tone: 'primary' },
  { name: 'Backup', tone: 'success' },
  { name: 'Storage', tone: 'warning' },
  { name: 'Sync', tone: 'error' },
  { name: 'Assistant', tone: 'info' },
] as const;

export default function AvatarTones() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {members.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {tones.map(({ name, tone }) => (
          <Avatar key={tone} name={name} tone={tone} />
        ))}
      </div>
    </div>
  );
}
