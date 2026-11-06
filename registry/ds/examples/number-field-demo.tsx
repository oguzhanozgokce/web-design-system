import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldDemo() {
  return (
    <NumberField
      label="Quantity"
      description="Choose from 1 to 99."
      defaultValue={5}
      minValue={1}
      maxValue={99}
      isAnimated
    />
  );
}
