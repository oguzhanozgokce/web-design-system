import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldDemo() {
  return (
    <NumberField
      label="Seats"
      description="Billed at $12 per seat each month."
      defaultValue={5}
      minValue={1}
      maxValue={200}
      isAnimated
    />
  );
}
