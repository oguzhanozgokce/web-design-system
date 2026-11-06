'use client';

import { useRef, useState } from 'react';
import { useLocale } from 'react-aria-components';
import { AddIcon } from '@/registry/ds/lib/icons';
import { ExtendedFab } from '@/registry/ds/ui/fab';

const transactions = [
  { id: 1, payee: 'Acme Corp', note: 'Invoice INV-2038 paid', amount: 4200 },
  { id: 2, payee: 'Figma', note: 'Team plan, November', amount: -45 },
  { id: 3, payee: 'Hetzner', note: 'Servers, October usage', amount: -186.4 },
  { id: 4, payee: 'Northwind Traders', note: 'Invoice INV-2036 paid', amount: 1280 },
  { id: 5, payee: 'Linear', note: 'Standard plan, 6 seats', amount: -48 },
  { id: 6, payee: 'Payroll', note: 'Contractors, first half', amount: -9350 },
  { id: 7, payee: 'Globex', note: 'Retainer, November', amount: 3000 },
  { id: 8, payee: 'Google Workspace', note: 'Business Starter, 6 users', amount: -42 },
  { id: 9, payee: 'Initech', note: 'Invoice INV-2031 paid', amount: 760 },
  { id: 10, payee: 'Notion', note: 'Plus plan, yearly', amount: -96 },
];

export default function FabScroll() {
  const { locale } = useLocale();
  const [isExtended, setExtended] = useState(true);
  const lastScrollTop = useRef(0);
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'exceptZero',
  });

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-surface-container-low">
      <div
        role="region"
        aria-label="Recent transactions"
        tabIndex={0}
        className="h-80 overflow-y-auto focus-ring-inset"
        onScroll={(event) => {
          const top = event.currentTarget.scrollTop;
          if (Math.abs(top - lastScrollTop.current) < 8) return;
          setExtended(top < lastScrollTop.current || top < 8);
          lastScrollTop.current = top;
        }}
      >
        <ul className="divide-y divide-outline-variant pb-24">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-title-sm text-on-surface">{transaction.payee}</p>
                <p className="truncate text-body-sm text-on-surface-variant">{transaction.note}</p>
              </div>
              <p className="text-body-md text-on-surface tabular-digits">
                {money.format(transaction.amount)}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <ExtendedFab
        icon={<AddIcon />}
        isExtended={isExtended}
        className="absolute inset-e-4 bottom-4"
      >
        New transaction
      </ExtendedFab>
    </div>
  );
}
