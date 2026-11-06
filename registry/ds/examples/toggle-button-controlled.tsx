'use client';

import { useState } from 'react';
import { NotificationsIcon } from '@/registry/ds/lib/icons';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonControlled() {
  const [watching, setWatching] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleButton
        variant="tonal"
        startIcon={<NotificationsIcon />}
        isSelected={watching}
        onChange={setWatching}
      >
        Watch invoice
      </ToggleButton>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {watching ? 'You will get an email when INV-2048 is paid.' : 'No email for INV-2048 yet.'}
      </p>
    </div>
  );
}
