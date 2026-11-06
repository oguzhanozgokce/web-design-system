import { Avatar } from '@/registry/ds/ui/avatar';

const members = [
  'Amara Okafor',
  'Kenji Watanabe',
  'Sofia Rossi',
  'Mateo García',
  'Priya Sharma',
  'Lars Eriksson',
  'Layla Haddad',
  'Noah Fischer',
];

export default function AvatarColors() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {members.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Avatar name="Assistant" tone="neutral" />
        <Avatar name="Support" tone="tertiary" />
      </div>
    </div>
  );
}
