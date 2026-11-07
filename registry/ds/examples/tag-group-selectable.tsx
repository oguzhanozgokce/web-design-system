'use client';

import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { Tag, TagGroup } from '@/registry/ds/ui/tag';

const topics = [
  { id: 'mentions', name: 'Mentions' },
  { id: 'comments', name: 'Comments' },
  { id: 'followers', name: 'New followers' },
  { id: 'summary', name: 'Weekly summary' },
];

export default function TagGroupSelectable() {
  const [selected, setSelected] = useState<Selection>(new Set(['mentions', 'comments']));
  const count = selected === 'all' ? topics.length : selected.size;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <TagGroup
        label="Notify me about"
        variant="outline"
        tone="primary"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        items={topics}
      >
        {(topic) => <Tag id={topic.id}>{topic.name}</Tag>}
      </TagGroup>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        {count} of {topics.length} notifications on
      </p>
    </div>
  );
}
