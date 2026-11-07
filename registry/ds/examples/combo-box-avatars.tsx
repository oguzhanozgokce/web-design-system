import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const people = [
  { id: 'amara', name: 'Amara Okafor', email: 'amara@example.com' },
  { id: 'hiroshi', name: 'Hiroshi Tanaka', email: 'hiroshi@example.com' },
  { id: 'priya', name: 'Priya Sharma', email: 'priya@example.com' },
  { id: 'mateo', name: 'Mateo García', email: 'mateo@example.com' },
  { id: 'sofia', name: 'Sofia Rossi', email: 'sofia@example.com' },
];

const tones = [
  'bg-neutral-soft text-on-surface',
  'bg-primary-soft text-on-primary-soft',
  'bg-info-soft text-on-info-soft',
];

function Initials({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  return (
    <span
      className={`flex items-center justify-center rounded-full text-xs font-medium ${tones[index % tones.length]}`}
    >
      {initials}
    </span>
  );
}

export default function ComboBoxAvatars() {
  return (
    <ComboBox
      label="Share with"
      placeholder="Name or email"
      defaultItems={people}
      menuTrigger="focus"
      className="w-full max-w-xs"
    >
      {(person) => (
        <ListBoxItem
          avatar={<Initials name={person.name} index={people.indexOf(person)} />}
          description={person.email}
          keywords={[person.email]}
        >
          {person.name}
        </ListBoxItem>
      )}
    </ComboBox>
  );
}
