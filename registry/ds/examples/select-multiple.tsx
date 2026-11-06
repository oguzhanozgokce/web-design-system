import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select, type SelectValueDisplay } from '@/registry/ds/ui/select';

const colours = [
  { id: 'red', name: 'Red' },
  { id: 'orange', name: 'Orange' },
  { id: 'yellow', name: 'Yellow' },
  { id: 'green', name: 'Green' },
  { id: 'blue', name: 'Blue' },
  { id: 'purple', name: 'Purple' },
];

const displays: SelectValueDisplay[] = ['text', 'count', 'chips'];

export default function SelectMultiple() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      {displays.map((display) => (
        <Select
          key={display}
          label={`Colours, ${display}`}
          selectionMode="multiple"
          valueDisplay={display}
          items={colours}
          defaultValue={['red', 'green', 'blue']}
        >
          {(colour) => <ListBoxItem>{colour.name}</ListBoxItem>}
        </Select>
      ))}
    </div>
  );
}
