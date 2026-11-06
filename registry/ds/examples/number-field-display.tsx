import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldDisplay() {
  return (
    <NumberField
      label="Quantity"
      size="display"
      defaultValue={1}
      minValue={1}
      maxValue={10}
      description="Up to 10 at a time."
      isAnimated
    />
  );
}
