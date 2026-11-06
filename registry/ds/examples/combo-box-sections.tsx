import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';

const continents = [
  {
    id: 'africa',
    name: 'Africa',
    children: [
      { id: 'ghana', name: 'Ghana', capital: 'Accra' },
      { id: 'kenya', name: 'Kenya', capital: 'Nairobi' },
    ],
  },
  {
    id: 'asia',
    name: 'Asia',
    children: [
      { id: 'india', name: 'India', capital: 'New Delhi' },
      { id: 'japan', name: 'Japan', capital: 'Tokyo' },
    ],
  },
  {
    id: 'europe',
    name: 'Europe',
    children: [
      { id: 'france', name: 'France', capital: 'Paris' },
      { id: 'spain', name: 'Spain', capital: 'Madrid' },
    ],
  },
  {
    id: 'americas',
    name: 'Americas',
    children: [
      { id: 'brazil', name: 'Brazil', capital: 'Brasília' },
      { id: 'canada', name: 'Canada', capital: 'Ottawa' },
    ],
  },
];

export default function ComboBoxSections() {
  return (
    <ComboBox
      label="Country"
      placeholder="Search countries"
      defaultItems={continents}
      className="w-full max-w-xs"
    >
      {(continent) => (
        <ListBoxSection id={continent.id} title={continent.name} items={continent.children}>
          {(country) => <ListBoxItem description={country.capital}>{country.name}</ListBoxItem>}
        </ListBoxSection>
      )}
    </ComboBox>
  );
}
