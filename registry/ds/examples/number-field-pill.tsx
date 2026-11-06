import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldPill() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <NumberField
        label="Small"
        shape="pill"
        size="sm"
        defaultValue={1}
        minValue={0}
        maxValue={999}
        isAnimated
      />
      <NumberField
        label="Medium"
        shape="pill"
        defaultValue={12}
        minValue={0}
        maxValue={999}
        isAnimated
      />
      <NumberField
        label="Large"
        shape="pill"
        size="lg"
        defaultValue={128}
        minValue={0}
        maxValue={999}
        isAnimated
      />
    </div>
  );
}
