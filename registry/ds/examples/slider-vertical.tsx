import { Slider } from '@/registry/ds/ui/slider';

const bands = [
  { label: 'Bass', value: 0.6 },
  { label: 'Mid', value: 0.3 },
  { label: 'Treble', value: 0.1 },
];

export default function SliderVertical() {
  return (
    <div className="flex gap-10 ps-16">
      {bands.map((band) => (
        <Slider
          key={band.label}
          orientation="vertical"
          size="md"
          label={band.label}
          defaultValue={band.value}
          minValue={0}
          maxValue={1}
          step={0.1}
          formatOptions={{ style: 'percent' }}
        />
      ))}
    </div>
  );
}
