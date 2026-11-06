import { NumberField } from '@/registry/ds/ui/number-field';

export default function NumberFieldSteps() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <NumberField
        label="Session timeout"
        description="Signs people out after this long without activity."
        defaultValue={30}
        minValue={5}
        maxValue={240}
        step={5}
        formatOptions={{ style: 'unit', unit: 'minute', unitDisplay: 'long' }}
      />
      <NumberField
        label="Hourly rate"
        layout="inline"
        description="Rounded to the nearest 50 cents."
        defaultValue={85}
        minValue={20}
        step={0.5}
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />
    </div>
  );
}
