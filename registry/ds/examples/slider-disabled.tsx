import { Slider } from '@/registry/ds/ui/slider';

export default function SliderDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Slider
        isDisabled
        label="API requests per minute"
        description="Set by your plan. Upgrade to change it."
        defaultValue={600}
        minValue={100}
        maxValue={1000}
        step={100}
      />
      <Slider
        isDisabled
        label="Discount window"
        defaultValue={[20, 60]}
        formatOptions={{ style: 'unit', unit: 'day', unitDisplay: 'long' }}
      />
    </div>
  );
}
