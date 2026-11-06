import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

export default function ChipSizes() {
  return (
    <div className="flex flex-col gap-6">
      {(['md', 'sm'] as const).map((size) => (
        <ChipGroup
          key={size}
          label={`Size ${size}`}
          size={size}
          selectionMode="multiple"
          defaultSelectedKeys={['travel']}
        >
          <Chip id="travel">Travel</Chip>
          <Chip id="food">Food</Chip>
          <Chip id="music">Music</Chip>
          <Chip id="sports">Sports</Chip>
        </ChipGroup>
      ))}
    </div>
  );
}
