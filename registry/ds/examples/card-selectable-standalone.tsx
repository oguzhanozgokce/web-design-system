'use client';

import { useState } from 'react';
import { CardContent, CardHeader, SelectableCard } from '@/registry/ds/ui/card';

export default function CardSelectableStandalone() {
  const [prioritySupport, setPrioritySupport] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <SelectableCard isSelected={prioritySupport} onChange={setPrioritySupport}>
        <CardHeader title="Priority support" description="Replies within 2 business hours." />
        <CardContent className="text-title-sm tabular-digits">+19 USD a month</CardContent>
      </SelectableCard>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Total: {prioritySupport ? '48 USD' : '29 USD'} a month
      </p>
    </div>
  );
}
