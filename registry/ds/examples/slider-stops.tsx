import { Slider } from '@/registry/ds/ui/slider';

export default function SliderStops() {
  return (
    <Slider
      label="Font size"
      description="Larger text is easier to read on small screens."
      defaultValue={16}
      minValue={12}
      maxValue={24}
      step={2}
      className="max-w-sm"
    />
  );
}
