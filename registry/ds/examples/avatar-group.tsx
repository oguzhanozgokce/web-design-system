import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';

const members = [
  'Amara Okafor',
  'Kenji Watanabe',
  'Sofia Rossi',
  'Mateo García',
  'Priya Sharma',
  'Lars Eriksson',
];

export default function AvatarGroupExample() {
  return (
    <AvatarGroup aria-label="Project members" max={3} size="md">
      {members.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  );
}
