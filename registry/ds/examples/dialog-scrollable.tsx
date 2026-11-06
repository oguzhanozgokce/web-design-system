'use client';

import { useLocale } from 'react-aria-components';
import { UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/registry/ds/ui/dialog';

const merchants = [
  'Northwind Supplies',
  'Contoso Cloud',
  'Fabrikam Office',
  'Tailspin Travel',
  'Litware Payroll',
  'Adventure Works',
];

const transactions = Array.from({ length: 24 }, (_, index) => ({
  id: `TX-${4100 + index}`,
  merchant: merchants[index % merchants.length],
  amount: -((index * 37.5 + 12.9) % 940),
  day: (index % 28) + 1,
}));

export default function DialogScrollable() {
  const { locale } = useLocale();
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });

  return (
    <DialogTrigger>
      <Button variant="outlined" startIcon={<UploadIcon />}>
        Review import
      </Button>
      <Dialog>
        <DialogHeader
          title="Review 24 transactions"
          description="From march-statement.csv. Check the merchants before they reach the ledger."
        />
        <DialogBody>
          <ul className="divide-y divide-outline-variant">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex items-center justify-between gap-4 py-3">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-body-lg text-on-surface">
                    {transaction.merchant}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    {transaction.id} · {date.format(new Date(2026, 2, transaction.day))}
                  </span>
                </span>
                <span className="text-body-lg text-on-surface tabular-digits">
                  {currency.format(transaction.amount)}
                </span>
              </li>
            ))}
          </ul>
        </DialogBody>
        <DialogFooter>
          <Button slot="close" variant="text">
            Cancel
          </Button>
          <Button slot="close">Import 24</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
