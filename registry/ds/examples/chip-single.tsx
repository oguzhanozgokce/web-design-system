import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

export default function ChipSingle() {
  return (
    <ChipGroup
      label="Period"
      selectionMode="single"
      disallowEmptySelection
      defaultSelectedKeys={['30d']}
    >
      <Chip id="7d">Last 7 days</Chip>
      <Chip id="30d">Last 30 days</Chip>
      <Chip id="quarter">This quarter</Chip>
      <Chip id="year">This year</Chip>
    </ChipGroup>
  );
}
