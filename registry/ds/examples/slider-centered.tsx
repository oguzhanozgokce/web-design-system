import { Slider } from '@/registry/ds/ui/slider';

export default function SliderCentered() {
  return (
    <Slider
      label="Price adjustment"
      description="Applied to every item in the Spring catalogue."
      defaultValue={0.08}
      minValue={-0.2}
      maxValue={0.2}
      step={0.01}
      fillOffset={0}
      marks={[-0.2, 0, 0.2]}
      formatOptions={{ style: 'percent', signDisplay: 'exceptZero' }}
      className="max-w-sm"
    />
  );
}
