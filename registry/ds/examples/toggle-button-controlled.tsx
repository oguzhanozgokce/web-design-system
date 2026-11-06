'use client';

import { useState } from 'react';
import { NotificationsIcon } from '@/registry/ds/lib/icons';
import { ToggleButton } from '@/registry/ds/ui/toggle-button';

export default function ToggleButtonControlled() {
  const [notify, setNotify] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleButton
        variant="tonal"
        startIcon={<NotificationsIcon />}
        isSelected={notify}
        onChange={setNotify}
      >
        Notify me
      </ToggleButton>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {notify
          ? 'You will get a notification for new replies.'
          : 'Notifications for replies are off.'}
      </p>
    </div>
  );
}
