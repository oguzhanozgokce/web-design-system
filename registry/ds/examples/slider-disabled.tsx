import { Slider } from '@/registry/ds/ui/slider';

export default function SliderDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider
        isDisabled
        label="Volume"
        description="Turn off silent mode to change it."
        defaultValue={60}
      />
      <Slider
        isDisabled
        label="Photo size"
        defaultValue={[100, 500]}
        maxValue={1000}
        formatOptions={{ style: 'unit', unit: 'megabyte', maximumFractionDigits: 0 }}
      />
    </div>
  );
}
