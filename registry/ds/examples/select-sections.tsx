import { ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectSections() {
  return (
    <Select label="Category" placeholder="Uncategorised" className="w-full max-w-xs">
      <ListBoxSection title="Income">
        <ListBoxItem id="salary">Salary</ListBoxItem>
        <ListBoxItem id="freelance">Freelance</ListBoxItem>
        <ListBoxItem id="refunds">Refunds</ListBoxItem>
      </ListBoxSection>
      <ListBoxSection title="Expenses">
        <ListBoxItem id="rent">Rent</ListBoxItem>
        <ListBoxItem id="groceries">Groceries</ListBoxItem>
        <ListBoxItem id="travel">Travel</ListBoxItem>
        <ListBoxItem id="subscriptions">Subscriptions</ListBoxItem>
      </ListBoxSection>
    </Select>
  );
}
