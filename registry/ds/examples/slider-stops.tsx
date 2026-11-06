import { Slider } from '@/registry/ds/ui/slider';

export default function SliderStops() {
  return (
    <Slider
      label="Payment retries"
      description="How many times a failed invoice is charged again before it is marked unpaid."
      defaultValue={3}
      minValue={0}
      maxValue={8}
      className="max-w-sm"
    />
  );
}
