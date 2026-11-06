'use client';

import { useLocale } from 'react-aria-components';
import { CalendarMonthIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Popover, PopoverDialog, PopoverTrigger } from '@/registry/ds/ui/popover';

export default function PopoverDemo() {
  const { locale } = useLocale();
  const start = new Date(2026, 11, 1, 10, 0);
  const end = new Date(2026, 11, 1, 10, 30);
  const day = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(start);
  const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).formatRange(start, end);

  return (
    <PopoverTrigger>
      <Button variant="tonal" startIcon={<CalendarMonthIcon />}>
        Next meeting
      </Button>
      <Popover>
        <PopoverDialog title="Weekly sync" showCloseButton>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
            <dt>Date</dt>
            <dd className="text-on-surface">{day}</dd>
            <dt>Time</dt>
            <dd className="text-on-surface tabular-digits">{time}</dd>
            <dt>Where</dt>
            <dd className="text-on-surface">Video call</dd>
          </dl>
        </PopoverDialog>
      </Popover>
    </PopoverTrigger>
  );
}
