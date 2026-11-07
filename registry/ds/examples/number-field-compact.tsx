import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldCompact() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <NumberField label="Guests" layout="compact" defaultValue={2} minValue={1} maxValue={16} />
      <NumberField
        label="Copies"
        layout="compact"
        variant="soft"
        defaultValue={98}
        minValue={1}
        maxValue={9999}
      />
    </div>
  );
}
