import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldLarge() {
  return (
    <NumberField
      label="Copies"
      size="lg"
      defaultValue={1}
      minValue={1}
      maxValue={10}
      description="Up to 10 at a time."
      isAnimated
    />
  );
}
