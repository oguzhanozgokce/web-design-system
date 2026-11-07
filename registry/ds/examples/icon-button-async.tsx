'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { RefreshIcon } from '@/registry/ds/lib/icons';
import { IconButton } from '@/registry/ds/ui/icon-button';

export default function IconButtonAsync() {
  const { locale } = useLocale();
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);

  return (
    <div className="flex items-center gap-3">
      <IconButton
        variant="outline"
        aria-label="Refresh"
        icon={<RefreshIcon />}
        onPress={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setSyncedAt(new Date());
        }}
      />
      <p className="text-sm text-on-surface-variant" aria-live="polite">
        {syncedAt
          ? `Updated at ${new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(syncedAt)}`
          : 'Updated this morning'}
      </p>
    </div>
  );
}
