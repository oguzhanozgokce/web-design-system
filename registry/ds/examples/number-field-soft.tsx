import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldSoft() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <NumberField
        label="Small"
        variant="soft"
        size="sm"
        defaultValue={1}
        minValue={0}
        maxValue={999}
        isAnimated
      />
      <NumberField
        label="Medium"
        variant="soft"
        defaultValue={12}
        minValue={0}
        maxValue={999}
        isAnimated
      />
      <NumberField
        label="Large"
        variant="soft"
        size="lg"
        defaultValue={128}
        minValue={0}
        maxValue={999}
        isAnimated
      />
    </div>
  );
}
