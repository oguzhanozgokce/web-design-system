import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const countries = [
  { id: 'DE', name: 'Germany', codes: 'DE · DEU', keywords: ['Deutschland', 'Allemagne'] },
  { id: 'ES', name: 'Spain', codes: 'ES · ESP', keywords: ['España', 'Espagne'] },
  { id: 'JP', name: 'Japan', codes: 'JP · JPN', keywords: ['日本', 'Nippon'] },
  { id: 'NL', name: 'Netherlands', codes: 'NL · NLD', keywords: ['Nederland', 'Holland'] },
  { id: 'TR', name: 'Türkiye', codes: 'TR · TUR', keywords: ['Turkey', 'Türkei'] },
  { id: 'GB', name: 'United Kingdom', codes: 'GB · GBR', keywords: ['UK', 'Britain'] },
];

export default function ComboBoxKeywords() {
  return (
    <ComboBox
      label="Tax residency"
      placeholder="Country, code or local name"
      description="Try “uk”, “Deutschland” or “日本”."
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
