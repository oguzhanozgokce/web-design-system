import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldLayouts() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-[1fr_1fr_auto]">
      <NumberField label="Guests" defaultValue={2} minValue={1} maxValue={12} />
      <NumberField
        label="Retry limit"
        layout="inline"
        defaultValue={3}
        minValue={0}
        maxValue={10}
      />
      <NumberField label="Copies" layout="compact" defaultValue={1} minValue={1} maxValue={99} />
    </div>
  );
}
