'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Tag, TagGroup, type TagTone } from '@/registry/ds/ui/tag';

const initialLabels: { id: string; name: string; tone: TagTone }[] = [
  { id: 'design', name: 'Design', tone: 'primary' },
  { id: 'beta', name: 'Beta', tone: 'info' },
  { id: 'approved', name: 'Approved', tone: 'success' },
  { id: 'needs-review', name: 'Needs review', tone: 'warning' },
];

export default function TagGroupRemovable() {
  const [labels, setLabels] = useState(initialLabels);

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-3">
      <TagGroup
        label="Labels"
        description="Shown on the card and used in search."
        items={labels}
        onRemove={(keys) => setLabels((current) => current.filter((label) => !keys.has(label.id)))}
      >
        {(label) => (
          <Tag id={label.id} tone={label.tone}>
            {label.name}
          </Tag>
        )}
      </TagGroup>
      <Button
        size="xs"
        variant="text"
        isDisabled={labels.length === initialLabels.length}
        onPress={() => setLabels(initialLabels)}
      >
        Restore labels
      </Button>
    </div>
  );
}
