import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldAnimated() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <NumberField label="Copies" defaultValue={9} minValue={1} maxValue={99} isAnimated />
      <NumberField
        label="Distance"
        layout="inline"
        defaultValue={12.5}
        minValue={0}
        step={0.5}
        formatOptions={{ style: 'unit', unit: 'kilometer' }}
        isAnimated
      />
    </div>
  );
}
