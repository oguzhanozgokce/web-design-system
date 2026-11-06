'use client';

import { useState } from 'react';
import { PersonIcon } from '@/registry/ds/lib/icons';
import { FilterChip } from '@/registry/ds/ui/chip';

export default function ChipFilter() {
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [mine, setMine] = useState(true);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <FilterChip isSelected={overdueOnly} onChange={setOverdueOnly}>
          Overdue only
        </FilterChip>
        <FilterChip startIcon={<PersonIcon />} isSelected={mine} onChange={setMine}>
          Assigned to me
        </FilterChip>
      </div>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Showing {overdueOnly ? 'overdue' : 'all'} invoices{' '}
        {mine ? 'assigned to you' : 'for the whole team'}.
      </p>
    </div>
  );
}
