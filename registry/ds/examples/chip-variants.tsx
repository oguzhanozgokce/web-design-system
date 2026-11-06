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
          defaultSelectedKeys={['card']}
        >
          <Chip id="card">Card</Chip>
          <Chip id="transfer">Bank transfer</Chip>
          <Chip id="cash">Cash</Chip>
        </ChipGroup>
      ))}
    </div>
  );
}
