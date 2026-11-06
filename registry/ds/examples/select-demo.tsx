import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

const currencies = [
  { id: 'TRY', name: 'Turkish lira' },
  { id: 'EUR', name: 'Euro' },
  { id: 'USD', name: 'US dollar' },
  { id: 'GBP', name: 'Pound sterling' },
  { id: 'JPY', name: 'Japanese yen' },
];

export default function SelectDemo() {
  return (
    <Select
      label="Default currency"
      description="New ledgers start in this currency."
      items={currencies}
      defaultValue="EUR"
      className="w-full max-w-xs"
    >
      {(currency) => <ListBoxItem description={currency.id}>{currency.name}</ListBoxItem>}
    </Select>
  );
}
