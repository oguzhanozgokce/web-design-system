import { LocationOnIcon } from '@/registry/ds/lib/icons';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const offices = [
  { id: 'ist', city: 'İstanbul', country: 'Türkiye' },
  { id: 'izm', city: 'İzmir', country: 'Türkiye' },
  { id: 'ber', city: 'Berlin', country: 'Germany' },
  { id: 'lis', city: 'Lisbon', country: 'Portugal' },
  { id: 'sao', city: 'São Paulo', country: 'Brazil' },
  { id: 'zur', city: 'Zürich', country: 'Switzerland' },
  { id: 'tyo', city: 'Tokyo', country: 'Japan' },
];

export default function ComboBoxDemo() {
  return (
    <ComboBox
      label="Issuing office"
      placeholder="Search cities"
      description="Accents and case are ignored: try “sao” or “zurich”."
      defaultItems={offices}
      startAdornment={<LocationOnIcon />}
      className="w-full max-w-xs"
    >
      {(office) => <ListBoxItem description={office.country}>{office.city}</ListBoxItem>}
    </ComboBox>
  );
}
