'use client';

import { useState } from 'react';
import { AvatarButton, AvatarGroup } from '@/registry/ds/ui/avatar';

const people = ['Amara Okafor', 'Kenji Watanabe', 'Sofia Rossi', 'Mateo García'];

export default function AvatarButtonExample() {
  const [assignee, setAssignee] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarGroup aria-label="Assign to" size="md" max={people.length}>
        {people.map((name) => (
          <AvatarButton
            key={name}
            name={name}
            aria-label={`Assign to ${name}`}
            onPress={() => setAssignee(name)}
          />
        ))}
      </AvatarGroup>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        {assignee ? `Assigned to ${assignee}` : 'Pick someone to assign'}
      </p>
    </div>
  );
}
