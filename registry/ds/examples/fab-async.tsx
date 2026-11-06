'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { SyncIcon } from '@/registry/ds/lib/icons';
import { ExtendedFab } from '@/registry/ds/ui/fab';

export default function FabAsync() {
  const { locale } = useLocale();
  const [imported, setImported] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3">
      <ExtendedFab
        color="secondary"
        icon={<SyncIcon />}
        onPress={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1800));
          setImported((count) => count + 12);
        }}
      >
        Sync bank feed
      </ExtendedFab>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {new Intl.NumberFormat(locale).format(imported)} transactions imported
      </p>
    </div>
  );
}
