import { Slider } from '@/registry/ds/ui/slider';

export default function SliderMarks() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider
        label="Delay"
        defaultValue={15}
        minValue={0}
        maxValue={60}
        step={5}
        marks={[0, 15, 30, 45, 60]}
        formatOptions={{ style: 'unit', unit: 'minute', unitDisplay: 'short' }}
      />
      <Slider
        label="Quality"
        defaultValue={1}
        minValue={0}
        maxValue={2}
        showValueLabel={false}
        showValueIndicator={false}
        marks={[
          { value: 0, label: 'Low' },
          { value: 1, label: 'Medium' },
          { value: 2, label: 'High' },
        ]}
      />
    </div>
  );
}
