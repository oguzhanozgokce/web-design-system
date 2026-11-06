import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

export default function ChipDisabled() {
  return (
    <div className="flex flex-col gap-6">
      <ChipGroup
        label="Export format"
        selectionMode="single"
        defaultSelectedKeys={['csv']}
        disabledKeys={['xlsx']}
      >
        <Chip id="csv">CSV</Chip>
        <Chip id="pdf">PDF</Chip>
        <Chip id="xlsx">XLSX</Chip>
      </ChipGroup>
      <ChipGroup
        label="Teams"
        description="Only admins can change teams."
        selectionMode="multiple"
        defaultSelectedKeys={['design']}
        isDisabled
      >
        <Chip id="design">Design</Chip>
        <Chip id="marketing">Marketing</Chip>
        <Chip id="support">Support</Chip>
      </ChipGroup>
    </div>
  );
}
