'use client';

import { useState } from 'react';
import { Switch } from '@/registry/ds/ui/switch';

export default function SwitchControlled() {
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <Switch isSelected={maintenance} onChange={setMaintenance}>
        Maintenance mode
      </Switch>
      <p className="text-body-md text-on-surface-variant" aria-live="polite">
        {maintenance
          ? 'Checkout is paused. Customers see the maintenance page.'
          : 'Checkout is live.'}
      </p>
    </div>
  );
}
