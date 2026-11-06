import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

const members = [
  { id: 'ayse', name: 'Ayşe Demir', email: 'ayse@harbor.co' },
  { id: 'mehmet', name: 'Mehmet Kaya', email: 'mehmet@harbor.co' },
  { id: 'elif', name: 'Elif Şahin', email: 'elif@harbor.co' },
  { id: 'jonas', name: 'Jonas Weber', email: 'jonas@harbor.co' },
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

export default function ListBoxAvatars() {
  return (
    <ListBox
      aria-label="Reviewer"
      items={members}
      selectionMode="single"
      defaultSelectedKeys={['mehmet']}
      variant="outlined"
      className="w-full max-w-xs"
    >
      {(member) => (
        <ListBoxItem
          avatar={<Initials name={member.name} index={members.indexOf(member)} />}
          description={member.email}
        >
          {member.name}
        </ListBoxItem>
      )}
    </ListBox>
  );
}
