import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldLayouts() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <NumberField label="Guests" defaultValue={2} minValue={1} maxValue={12} />
      <NumberField
        label="Retry limit"
        layout="inline"
        defaultValue={3}
        minValue={0}
        maxValue={10}
      />
    </div>
  );
}
