'use client';

import { useLocale } from 'react-aria-components';
import { CalendarMonthIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Popover, PopoverDialog, PopoverTrigger } from '@/registry/ds/ui/popover';

export default function PopoverDemo() {
  const { locale } = useLocale();
  const amount = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(240);
  const renewal = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(
    new Date(2026, 11, 1),
  );

  return (
    <PopoverTrigger>
      <Button variant="tonal" startIcon={<CalendarMonthIcon />}>
        Billing cycle
      </Button>
      <Popover>
        <PopoverDialog title="Next invoice" showCloseButton>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
            <dt>Plan</dt>
            <dd className="text-on-surface">Team, 12 seats</dd>
            <dt>Amount</dt>
            <dd className="text-on-surface tabular-digits">{amount}</dd>
            <dt>Renews</dt>
            <dd className="text-on-surface">{renewal}</dd>
          </dl>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  );
}
