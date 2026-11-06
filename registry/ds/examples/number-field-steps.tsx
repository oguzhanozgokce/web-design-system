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
        label="Temperature"
        layout="inline"
        description="In steps of half a degree."
        defaultValue={21}
        minValue={10}
        maxValue={30}
        step={0.5}
        formatOptions={{ style: 'unit', unit: 'celsius' }}
      />
    </div>
  );
}
