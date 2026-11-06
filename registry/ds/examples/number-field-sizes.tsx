import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldSizes() {
  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
      <NumberField size="sm" label="Small, 36 px" defaultValue={2} minValue={0} />
      <NumberField size="md" label="Medium, 40 px" defaultValue={2} minValue={0} />
      <NumberField size="lg" label="Large, 48 px" defaultValue={2} minValue={0} />
    </div>
  );
}
