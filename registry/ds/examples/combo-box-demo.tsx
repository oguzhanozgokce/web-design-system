import { LocationOnIcon } from '@/registry/ds/lib/icons';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const cities = [
  { id: 'ist', name: 'Istanbul', country: 'Turkey' },
  { id: 'krk', name: 'Kraków', country: 'Poland' },
  { id: 'lis', name: 'Lisbon', country: 'Portugal' },
  { id: 'nbo', name: 'Nairobi', country: 'Kenya' },
  { id: 'rey', name: 'Reykjavík', country: 'Iceland' },
  { id: 'sao', name: 'São Paulo', country: 'Brazil' },
  { id: 'tyo', name: 'Tokyo', country: 'Japan' },
  { id: 'zur', name: 'Zürich', country: 'Switzerland' },
];

export default function ComboBoxDemo() {
  return (
    <ComboBox
      label="City"
      placeholder="Search cities"
      description="Accents and case are ignored: try “sao” or “zurich”."
      defaultItems={cities}
      startAdornment={<LocationOnIcon />}
      className="w-full max-w-xs"
    >
      {(city) => <ListBoxItem description={city.country}>{city.name}</ListBoxItem>}
    </ComboBox>
  );
}
