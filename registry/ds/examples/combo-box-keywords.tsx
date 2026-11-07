import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const countries = [
  {
    id: 'DE',
    name: 'Germany',
    codes: 'DE · DEU',
    keywords: ['German Republic', 'Federal Republic'],
  },
  { id: 'ES', name: 'Spain', codes: 'ES · ESP', keywords: ['Kingdom of Spain', 'Spanish Kingdom'] },
  { id: 'JP', name: 'Japan', codes: 'JP · JPN', keywords: ['Japanese Islands', 'East Asia'] },
  { id: 'NL', name: 'Netherlands', codes: 'NL · NLD', keywords: ['Dutch Kingdom', 'Holland'] },
  { id: 'TR', name: 'Turkey', codes: 'TR · TUR', keywords: ['Turkey', 'Republic of Turkey'] },
  { id: 'GB', name: 'United Kingdom', codes: 'GB · GBR', keywords: ['UK', 'Britain'] },
];

export default function ComboBoxKeywords() {
  return (
    <ComboBox
      label="Country"
      placeholder="Country, code or alternate name"
      description="Try “uk”, “Britain” or “Japanese Islands”."
      defaultItems={countries}
      className="w-full max-w-xs"
    >
      {(country) => (
        <ListBoxItem
          description={country.codes}
          keywords={[country.id, country.codes.split(' · ')[1], ...country.keywords]}
        >
          {country.name}
        </ListBoxItem>
      )}
    </ComboBox>
  );
}
