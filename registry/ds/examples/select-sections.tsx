import { ListBoxItem, ListBoxSection } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectSections() {
  return (
    <Select label="Ingredient" placeholder="Choose an ingredient" className="w-full max-w-xs">
      <ListBoxSection title="Fruits">
        <ListBoxItem id="apple">Apple</ListBoxItem>
        <ListBoxItem id="banana">Banana</ListBoxItem>
        <ListBoxItem id="orange">Orange</ListBoxItem>
      </ListBoxSection>
      <ListBoxSection title="Vegetables">
        <ListBoxItem id="broccoli">Broccoli</ListBoxItem>
        <ListBoxItem id="carrot">Carrot</ListBoxItem>
        <ListBoxItem id="spinach">Spinach</ListBoxItem>
        <ListBoxItem id="tomato">Tomato</ListBoxItem>
      </ListBoxSection>
    </Select>
  );
}
