'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Chip, ChipGroup } from '@/registry/ds/ui/chip';

const collaborators = [
  { id: 'ayse', name: 'Ayşe Demir', initials: 'AD' },
  { id: 'jonas', name: 'Jonas Weber', initials: 'JW' },
  { id: 'priya', name: 'Priya Natarajan', initials: 'PN' },
];

export default function ChipInput() {
  const [people, setPeople] = useState(collaborators);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <ChipGroup
        label="Share with"
        description="Everyone listed can view and comment."
        items={people}
        onRemove={(keys) => setPeople((current) => current.filter(({ id }) => !keys.has(id)))}
        renderEmptyState={() => 'Only you can see this.'}
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
        isDisabled={people.length === collaborators.length}
        onPress={() => setPeople(collaborators)}
      >
        Reset list
      </Button>
    </div>
  );
}
