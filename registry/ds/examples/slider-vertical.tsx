import { Slider } from '@/registry/ds/ui/slider';

const channels = [
  { label: 'Email', value: 0.6 },
  { label: 'Push', value: 0.3 },
  { label: 'SMS', value: 0.1 },
];

export default function SliderVertical() {
  return (
    <div className="flex gap-10 ps-16">
      {channels.map((channel) => (
        <Slider
          key={channel.label}
          orientation="vertical"
          size="md"
          label={channel.label}
          defaultValue={channel.value}
          minValue={0}
          maxValue={1}
          step={0.1}
          formatOptions={{ style: 'percent' }}
        />
      ))}
    </div>
  );
}
