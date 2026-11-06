import { Slider } from '@/registry/ds/ui/slider';

export default function SliderMarks() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider
        label="Log retention"
        defaultValue={30}
        minValue={7}
        maxValue={90}
        marks={[7, 30, 60, 90]}
        formatOptions={{ style: 'unit', unit: 'day', unitDisplay: 'long' }}
      />
      <Slider
        label="Support priority"
        defaultValue={1}
        minValue={0}
        maxValue={2}
        showValueLabel={false}
        showValueIndicator={false}
        marks={[
          { value: 0, label: 'Standard' },
          { value: 1, label: 'Priority' },
          { value: 2, label: 'Dedicated' },
        ]}
      />
    </div>
  );
}
