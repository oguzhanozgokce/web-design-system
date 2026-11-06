import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

const members = [
  { id: 'ayse', name: 'Ayşe Demir', role: 'Owner' },
  { id: 'mehmet', name: 'Mehmet Kaya', role: 'Accountant' },
  { id: 'elif', name: 'Elif Şahin', role: 'Viewer' },
  { id: 'jonas', name: 'Jonas Weber', role: 'Accountant' },
];

const tones = [
  'bg-primary-container text-on-primary-container',
  'bg-primary text-on-primary',
  'bg-tertiary-container text-on-tertiary-container',
];

function Initials({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  return (
    <span
      className={`flex items-center justify-center rounded-full text-label-md ${tones[index % tones.length]}`}
    >
      {initials}
    </span>
  );
}

export default function SelectAvatars() {
  return (
    <Select
      label="Approver"
      placeholder="Choose a teammate"
      items={members}
      className="w-full max-w-xs"
    >
      {(member) => (
        <ListBoxItem
          avatar={<Initials name={member.name} index={members.indexOf(member)} />}
          description={member.role}
        >
          {member.name}
        </ListBoxItem>
      )}
    </Select>
  );
}
