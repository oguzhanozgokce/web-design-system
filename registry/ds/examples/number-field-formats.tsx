import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldFormats() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <NumberField
        label="Invoice total"
        layout="inline"
        defaultValue={1250}
        minValue={0}
        step={10}
        formatOptions={{ style: 'currency', currency: 'EUR' }}
      />
      <NumberField
        label="Early payment discount"
        layout="inline"
        defaultValue={0.05}
        minValue={0}
        maxValue={0.5}
        step={0.01}
        formatOptions={{ style: 'percent' }}
      />
      <NumberField
        label="Parcel weight"
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
