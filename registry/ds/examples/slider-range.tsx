import { Slider } from '@/registry/ds/ui/slider';

export default function SliderRange() {
  return (
    <Slider
      label="Price range"
      defaultValue={[100, 500]}
      minValue={0}
      maxValue={1000}
      step={10}
      formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      className="max-w-sm"
    />
  );
}
