import { Avatar, AvatarGroup } from '@/registry/ds/ui/avatar';

const approvers = [
  'Ayşe Demir',
  'Mehmet Kaya',
  'Elif Şahin',
  'Can Yılmaz',
  'Zeynep Arslan',
  'Emre Koç',
];

export default function AvatarGroupExample() {
  return (
    <AvatarGroup aria-label="Invoice approvers" max={3} size="md">
      {approvers.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </AvatarGroup>
  );
}
