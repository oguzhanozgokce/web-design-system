'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import {
  Sheet,
  SheetBody,
  SheetHeader,
  SheetTrigger,
  type SheetSnapPoint,
} from '@/registry/ds/ui/sheet';

const transactions = [
  { payee: 'Hetzner Online', category: 'Hosting', amount: -84.2 },
  { payee: 'Stripe payout', category: 'Income', amount: 4120 },
  { payee: 'Figma', category: 'Software', amount: -45 },
  { payee: 'Deutsche Bahn', category: 'Travel', amount: -129.9 },
  { payee: 'Northwind Traders', category: 'Income', amount: 1280 },
  { payee: 'Google Workspace', category: 'Software', amount: -64.8 },
  { payee: 'WeWork Kreuzberg', category: 'Office', amount: -550 },
  { payee: 'Lufthansa', category: 'Travel', amount: -312.4 },
  { payee: 'Contoso GmbH', category: 'Income', amount: 2600 },
  { payee: 'Notion Labs', category: 'Software', amount: -16 },
  { payee: 'Telekom', category: 'Utilities', amount: -49.95 },
  { payee: 'Fabrikam Ltd', category: 'Income', amount: 980 },
];

export default function SheetSnapPoints() {
  const { locale } = useLocale();
  const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>('50%');
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    signDisplay: 'exceptZero',
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <SheetTrigger>
        <Button variant="tonal">October transactions</Button>
        <Sheet
          side="bottom"
          snapPoints={['50%', '90%']}
          snapPoint={snapPoint}
          onSnapPointChange={setSnapPoint}
        >
          <SheetHeader
            title="October transactions"
            description={`${transactions.length} transactions, Operating account`}
          />
          <SheetBody>
            <ul className="flex flex-col divide-y divide-outline-variant">
              {transactions.map((transaction) => (
                <li key={transaction.payee} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-lg text-on-surface">{transaction.payee}</p>
                    <p className="text-body-sm text-on-surface-variant">{transaction.category}</p>
                  </div>
                  <span
                    className={
                      transaction.amount > 0
                        ? 'text-label-lg text-success tabular-digits'
                        : 'text-label-lg text-on-surface tabular-digits'
                    }
                  >
                    {money.format(transaction.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </SheetBody>
        </Sheet>
      </SheetTrigger>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        Opens at {snapPoint} of the screen
      </p>
    </div>
  );
}
