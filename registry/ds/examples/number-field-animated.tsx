import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldAnimated() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <NumberField label="Seats" defaultValue={9} minValue={1} maxValue={500} isAnimated />
      <NumberField
        label="Monthly budget"
        layout="inline"
        defaultValue={1950}
        minValue={0}
        step={50}
        formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        isAnimated
      />
    </div>
  );
}
