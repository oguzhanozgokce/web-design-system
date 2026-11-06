import { FilterIcon } from '@/registry/ds/lib/icons';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const categories = [
  { id: 'travel', name: 'Travel', keywords: ['flights', 'hotels'] },
  { id: 'meals', name: 'Meals', keywords: ['restaurants', 'lunch'] },
  { id: 'software', name: 'Software', keywords: ['SaaS', 'subscriptions'] },
  { id: 'hardware', name: 'Hardware', keywords: ['laptops', 'phones'] },
  { id: 'office', name: 'Office supplies', keywords: ['stationery'] },
  { id: 'training', name: 'Training', keywords: ['courses', 'conferences'] },
];

export default function ComboBoxMultiple() {
  return (
    <ComboBox
      label="Categories"
      placeholder="Search"
      description="The report includes transactions in any of these."
      selectionMode="multiple"
      defaultItems={categories}
      defaultValue={['travel', 'meals']}
      startAdornment={<FilterIcon />}
      className="w-full max-w-xs"
    >
      {(category) => <ListBoxItem keywords={category.keywords}>{category.name}</ListBoxItem>}
    </ComboBox>
  );
}
