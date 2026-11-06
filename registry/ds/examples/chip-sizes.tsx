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
          defaultSelectedKeys={['eur']}
        >
          <Chip id="eur">EUR</Chip>
          <Chip id="usd">USD</Chip>
          <Chip id="try">TRY</Chip>
          <Chip id="gbp">GBP</Chip>
        </ChipGroup>
      ))}
    </div>
  );
}
