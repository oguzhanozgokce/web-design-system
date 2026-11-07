import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const fruits = ['Apple', 'Banana', 'Cherry', 'Mango'];

export default function ComboBoxVariants() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
      {(['outline', 'soft'] as const).map((variant) => (
        <ComboBox
          key={variant}
          label={`Fruit, ${variant}`}
          placeholder="Search fruits"
          variant={variant}
        >
          {fruits.map((fruit) => (
            <ListBoxItem key={fruit} id={fruit}>
              {fruit}
            </ListBoxItem>
          ))}
        </ComboBox>
      ))}
      {(['sm', 'lg'] as const).map((size) => (
        <ComboBox key={size} label={`Fruit, size ${size}`} placeholder="Search fruits" size={size}>
          {fruits.map((fruit) => (
            <ListBoxItem key={fruit} id={fruit}>
              {fruit}
            </ListBoxItem>
          ))}
        </ComboBox>
      ))}
    </div>
  );
}
