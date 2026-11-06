import { Slider } from '@/registry/ds/ui/slider';

export default function SliderDemo() {
  return (
    <Slider
      label="Monthly spending limit"
      description="Card payments above this amount are declined until the next billing cycle."
      defaultValue={1500}
      minValue={0}
      maxValue={5000}
      step={100}
      formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      className="max-w-sm"
    />
  );
}
