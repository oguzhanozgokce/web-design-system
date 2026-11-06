'use client';

import { useLocale } from 'react-aria-components';
import { DownloadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTrigger } from '@/registry/ds/ui/sheet';

const lines = [
  { item: 'Team plan, 12 seats', amount: 288 },
  { item: 'Extra storage, 200 GB', amount: 40 },
  { item: 'Priority support', amount: 60 },
];

export default function SheetDemo() {
  const { locale } = useLocale();
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <SheetTrigger>
      <Button variant="tonal">View invoice</Button>
      <Sheet>
        <SheetHeader title="Invoice INV-2048" description="Northwind Traders, due 14 November" />
        <SheetBody>
          <dl className="flex flex-col gap-3">
            {lines.map((line) => (
              <div key={line.item} className="flex items-baseline justify-between gap-4">
                <dt className="text-on-surface-variant">{line.item}</dt>
                <dd className="tabular-digits">{money.format(line.amount)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-t border-outline-variant pt-3 text-title-sm">
              <dt>Total</dt>
              <dd className="tabular-digits">{money.format(total)}</dd>
            </div>
          </dl>
        </SheetBody>
        <SheetFooter>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
          <Button slot="close">Mark as paid</Button>
        </SheetFooter>
      </Sheet>
    </SheetTrigger>
  );
}
