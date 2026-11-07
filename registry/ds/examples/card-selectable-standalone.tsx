'use client';

import { useState } from 'react';
import { CardContent, CardHeader, SelectableCard } from '@/registry/ds/ui/card';

export default function CardSelectableStandalone() {
  const [backup, setBackup] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <SelectableCard isSelected={backup} onChange={setBackup}>
        <CardHeader
          title="Automatic backup"
          description="Save new photos and videos when you are on Wi-Fi."
        />
        <CardContent className="font-medium tabular-digits">About 2 GB a month</CardContent>
      </SelectableCard>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        Backup is {backup ? 'on' : 'off'}.
      </p>
    </div>
  );
}
