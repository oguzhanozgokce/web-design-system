'use client';

import { useLocale } from 'react-aria-components';
import { DownloadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

export default function SheetDemo() {
  const { locale } = useLocale();
  const size = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 1,
  });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });
  const details = [
    { label: 'Type', value: 'JPEG image' },
    { label: 'Size', value: size.format(3.2) },
    { label: 'Dimensions', value: '4032 × 3024' },
    { label: 'Taken', value: date.format(new Date(2026, 9, 14)) },
  ];

  return (
    <SheetTrigger>
      <Button variant="soft">View details</Button>
      <Sheet>
        <SheetHeader title="Photo details" description="IMG_2048.jpg" />
        <SheetBody>
          <dl className="flex flex-col gap-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-baseline justify-between gap-4">
                <dt className="text-on-surface-variant">{detail.label}</dt>
                <dd className="tabular-digits">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button slot="close">Done</Button>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}
