'use client';

import { useState } from 'react';
import { PersonIcon } from '@/registry/ds/lib/icons';
import { FilterChip } from '@/registry/ds/ui/chip';

export default function ChipFilter() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [mentions, setMentions] = useState(true);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <FilterChip isSelected={unreadOnly} onChange={setUnreadOnly}>
          Unread only
        </FilterChip>
        <FilterChip startIcon={<PersonIcon />} isSelected={mentions} onChange={setMentions}>
          Mentions
        </FilterChip>
      </div>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Showing {unreadOnly ? 'unread' : 'all'} messages
        {mentions ? ' that mention you' : ''}.
      </p>
    </div>
  );
}
