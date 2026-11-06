import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';

const accounts = [
  {
    id: 'bank',
    name: 'Bank accounts',
    children: [
      { id: 'garanti', name: 'Garanti BBVA', detail: 'TRY · •••• 4821' },
      { id: 'wise', name: 'Wise Business', detail: 'EUR · •••• 3310' },
    ],
  },
  {
    id: 'cards',
    name: 'Cards',
    children: [
      { id: 'amex', name: 'Company Amex', detail: 'USD · •••• 1005' },
      { id: 'bonus', name: 'Bonus Business', detail: 'TRY · •••• 7712' },
    ],
  },
  {
    id: 'cash',
    name: 'Cash',
    children: [{ id: 'petty', name: 'Petty cash', detail: 'Istanbul office' }],
  },
];

export default function ComboBoxSections() {
  return (
    <ComboBox
      label="Paid from"
      placeholder="Search accounts"
      defaultItems={accounts}
      className="w-full max-w-xs"
    >
      {(group) => (
        <ListBoxSection id={group.id} title={group.name} items={group.children}>
          {(account) => <ListBoxItem description={account.detail}>{account.name}</ListBoxItem>}
        </ListBoxSection>
      )}
    </ComboBox>
  );
}
