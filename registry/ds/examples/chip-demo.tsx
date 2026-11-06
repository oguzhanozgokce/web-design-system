'use client';

import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

const statuses = [
  { id: 'draft', name: 'Draft' },
  { id: 'sent', name: 'Sent' },
  { id: 'paid', name: 'Paid' },
  { id: 'overdue', name: 'Overdue' },
  { id: 'void', name: 'Void' },
];

export default function ChipDemo() {
  return (
    <ChipGroup
      label="Invoice status"
      selectionMode="multiple"
      defaultSelectedKeys={['sent', 'overdue']}
      items={statuses}
    >
      {(status) => <Chip id={status.id}>{status.name}</Chip>}
    </ChipGroup>
  );
}
