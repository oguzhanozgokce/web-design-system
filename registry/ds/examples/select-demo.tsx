import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

const countries = [
  { id: 'BR', name: 'Brazil' },
  { id: 'CA', name: 'Canada' },
  { id: 'IN', name: 'India' },
  { id: 'JP', name: 'Japan' },
  { id: 'KE', name: 'Kenya' },
];

export default function SelectDemo() {
  return (
    <Select
      label="Country"
      description="Used for dates and number formats."
      items={countries}
      defaultValue="JP"
      className="w-full max-w-xs"
    >
      {(country) => <ListBoxItem description={country.id}>{country.name}</ListBoxItem>}
    </Select>
  );
}
