import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

export default function ChipSingle() {
  return (
    <ChipGroup
      label="View"
      selectionMode="single"
      disallowEmptySelection
      defaultSelectedKeys={['week']}
    >
      <Chip id="day">Day</Chip>
      <Chip id="week">Week</Chip>
      <Chip id="month">Month</Chip>
      <Chip id="year">Year</Chip>
    </ChipGroup>
  );
}
