import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

const people = [
  { id: 'amara', name: 'Amara Okafor', role: 'Owner' },
  { id: 'hiroshi', name: 'Hiroshi Tanaka', role: 'Editor' },
  { id: 'sofia', name: 'Sofia Rossi', role: 'Viewer' },
  { id: 'mateo', name: 'Mateo García', role: 'Editor' },
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

export default function SelectAvatars() {
  return (
    <Select
      label="Assignee"
      placeholder="Choose a person"
      items={people}
      defaultValue="hiroshi"
      className="w-full max-w-xs"
    >
      {(person) => (
        <ListBoxItem
          avatar={<Initials name={person.name} index={people.indexOf(person)} />}
          description={person.role}
        >
          {person.name}
        </ListBoxItem>
      )}
    </Select>
  );
}
