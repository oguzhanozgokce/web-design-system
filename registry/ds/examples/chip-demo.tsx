'use client';

import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

const types = [
  { id: 'photos', name: 'Photos' },
  { id: 'videos', name: 'Videos' },
  { id: 'music', name: 'Music' },
  { id: 'documents', name: 'Documents' },
  { id: 'archives', name: 'Archives' },
];

export default function ChipDemo() {
  return (
    <ChipGroup
      label="File type"
      selectionMode="multiple"
      defaultSelectedKeys={['photos', 'music']}
      items={types}
    >
      {(type) => <Chip id={type.id}>{type.name}</Chip>}
    </ChipGroup>
  );
}
