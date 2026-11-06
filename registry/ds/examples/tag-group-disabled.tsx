import { Tag, TagGroup } from '@/registry/ds/ui/tag';

export default function TagGroupDisabled() {
  return (
    <TagGroup
      label="Access"
      description="Only workspace owners can change access."
      isDisabled
      onRemove={() => {}}
      className="w-full max-w-sm"
    >
      <Tag id="invoices">Invoices</Tag>
      <Tag id="payroll">Payroll</Tag>
      <Tag id="reports">Reports</Tag>
    </TagGroup>
  );
}
