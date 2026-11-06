import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

export default function ChipVariants() {
  return (
    <div className="flex flex-col gap-6">
      {(['outlined', 'elevated', 'tonal'] as const).map((variant) => (
        <ChipGroup
          key={variant}
          label={variant}
          variant={variant}
          selectionMode="multiple"
          defaultSelectedKeys={['photos']}
        >
          <Chip id="photos">Photos</Chip>
          <Chip id="videos">Videos</Chip>
          <Chip id="music">Music</Chip>
        </ChipGroup>
      ))}
    </div>
  );
}
