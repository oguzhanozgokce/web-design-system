import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldVariants() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <NumberField label="Outline" defaultValue={4} minValue={0} />
      <NumberField label="Soft" variant="soft" defaultValue={4} minValue={0} />
    </div>
  );
}
