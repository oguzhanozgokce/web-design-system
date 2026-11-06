import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

const people = [
  { id: 'amara', name: 'Amara Okafor', email: 'amara@example.com' },
  { id: 'hiroshi', name: 'Hiroshi Tanaka', email: 'hiroshi@example.com' },
  { id: 'sofia', name: 'Sofia Rossi', email: 'sofia@example.com' },
  { id: 'mateo', name: 'Mateo García', email: 'mateo@example.com' },
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
      aria-label="Assignee"
      items={people}
      selectionMode="single"
      defaultSelectedKeys={['hiroshi']}
      variant="outlined"
      className="w-full max-w-xs"
    >
      {(person) => (
        <ListBoxItem
          avatar={<Initials name={person.name} index={people.indexOf(person)} />}
          description={person.email}
        >
          {person.name}
        </ListBoxItem>
      )}
    </ListBox>
  );
}
