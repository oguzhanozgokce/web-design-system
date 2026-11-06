import { Slider } from '@/registry/ds/ui/slider';

export default function SliderRange() {
  return (
    <Slider
      label="Order total"
      defaultValue={[120, 480]}
      minValue={0}
      maxValue={1000}
      step={10}
      formatOptions={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
      className="max-w-sm"
    />
  );
}
