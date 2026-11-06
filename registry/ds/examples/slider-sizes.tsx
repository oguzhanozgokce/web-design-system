import { Slider } from '@/registry/ds/ui/slider';

export default function SliderSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Slider
          key={size}
          size={size}
          label={`Size ${size}`}
          defaultValue={64}
          formatOptions={{ style: 'unit', unit: 'percent' }}
        />
      ))}
    </div>
  );
}
