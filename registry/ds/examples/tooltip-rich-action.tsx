'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { SyncIcon } from '@/registry/ds/lib/icons';
import { Button, ButtonLink } from '@/registry/ds/ui/button';
import { RichTooltip, TooltipTrigger } from '@/registry/ds/ui/tooltip';

export default function TooltipRichAction() {
  const { locale } = useLocale();
  const [syncedAt, setSyncedAt] = useState(() => new Date(2026, 10, 6, 9, 42));
  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(syncedAt);

  return (
    <TooltipTrigger>
      <ButtonLink href="#rich-tooltip-with-an-action" variant="outlined" startIcon={<SyncIcon />}>
        Bank feed
      </ButtonLink>
      <RichTooltip
        title="Bank feed connected"
        placement="bottom"
        action={
          <Button
            variant="text"
            size="sm"
            onPress={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1200));
              setSyncedAt(new Date());
            }}
          >
            Sync now
          </Button>
        }
      >
        Last synced at {time}. New transactions arrive every hour and match open invoices
        automatically.
      </RichTooltip>
    </TooltipTrigger>
  );
}
