import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldFormats() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <NumberField
        label="Ticket price"
        layout="inline"
        defaultValue={24}
        minValue={0}
        step={1}
        formatOptions={{ style: 'currency', currency: 'EUR' }}
      />
      <NumberField
        label="Opacity"
        layout="inline"
        defaultValue={0.8}
        minValue={0}
        maxValue={1}
        step={0.05}
        formatOptions={{ style: 'percent' }}
      />
      <NumberField
        label="Weight"
        layout="inline"
        defaultValue={2.5}
        minValue={0.1}
        maxValue={30}
        step={0.1}
        formatOptions={{ style: 'unit', unit: 'kilogram' }}
      />
    </div>
  );
}
