import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldCompactSizes() {
  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-6">
      <NumberField label="Small, 32 px" layout="compact" size="sm" defaultValue={9} minValue={0} />
      <NumberField label="Medium, 40 px" layout="compact" defaultValue={9} minValue={0} />
      <NumberField label="Large, 48 px" layout="compact" size="lg" defaultValue={9} minValue={0} />
    </div>
  );
}
