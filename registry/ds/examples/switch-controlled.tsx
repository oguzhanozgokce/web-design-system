'use client';

import { useState } from 'react';
import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchControlled() {
  const [quiet, setQuiet] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <Switch isSelected={quiet} onChange={setQuiet}>
        Do not disturb
      </Switch>
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {quiet ? 'Notifications are paused.' : 'Notifications are on.'}
      </p>
    </div>
  );
}
