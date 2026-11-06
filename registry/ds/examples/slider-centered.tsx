import { Slider } from '@/registry/ds/ui/slider';

export default function SliderCentered() {
  return (
    <Slider
      label="Exposure"
      defaultValue={0.8}
      minValue={-2}
      maxValue={2}
      step={0.1}
      fillOffset={0}
      marks={[-2, 0, 2]}
      formatOptions={{ signDisplay: 'exceptZero', maximumFractionDigits: 1 }}
      className="max-w-sm"
    />
  );
}
