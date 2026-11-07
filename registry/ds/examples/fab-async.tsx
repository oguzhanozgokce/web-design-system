'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { SyncIcon } from '@/registry/ds/lib/icons';
import { ExtendedFab } from '@/registry/ds/ui/fab';

export default function FabAsync() {
  const { locale } = useLocale();
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <ExtendedFab
        tone="neutral"
        icon={<SyncIcon />}
        onPress={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1800));
          setSyncedAt(new Date());
        }}
      >
        Sync now
      </ExtendedFab>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        {syncedAt
          ? `Synced at ${new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(syncedAt)}`
          : 'Not synced yet'}
      </p>
    </div>
  );
}
