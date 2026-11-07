'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';

export default function ButtonAsync() {
  const { locale } = useLocale();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onPress={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setSavedAt(new Date());
        }}
      >
        Save changes
      </Button>
      <p className="text-xs text-on-surface-variant" aria-live="polite">
        {savedAt
          ? `Saved at ${new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(savedAt)}`
          : 'You have unsaved changes'}
      </p>
    </div>
  );
}
