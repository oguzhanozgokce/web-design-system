import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldFormats() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <NumberField
        label="Amount"
        layout="inline"
        defaultValue={1250}
        minValue={0}
        step={10}
        formatOptions={{ style: 'currency', currency: 'EUR' }}
      />
      <NumberField
        label="Discount"
        layout="inline"
        defaultValue={0.05}
        minValue={0}
        maxValue={0.5}
        step={0.01}
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
