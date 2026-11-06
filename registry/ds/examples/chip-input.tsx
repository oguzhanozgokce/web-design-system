'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

const approvers = [
  { id: 'ayse', name: 'Ayşe Demir', initials: 'AD' },
  { id: 'jonas', name: 'Jonas Weber', initials: 'JW' },
  { id: 'priya', name: 'Priya Natarajan', initials: 'PN' },
];

export default function ChipInput() {
  const [people, setPeople] = useState(approvers);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <ChipGroup
        label="Approvers"
        description="Everyone listed must approve before the payment runs."
        items={people}
        onRemove={(keys) => setPeople((current) => current.filter(({ id }) => !keys.has(id)))}
        renderEmptyState={() => 'No approvers. Payments over €5,000 need at least one.'}
      >
        {(person) => (
          <Chip id={person.id} avatar={person.initials}>
            {person.name}
          </Chip>
        )}
      </ChipGroup>
      <Button
        variant="text"
        size="sm"
        isDisabled={people.length === approvers.length}
        onPress={() => setPeople(approvers)}
      >
        Reset approvers
      </Button>
    </div>
  );
}
