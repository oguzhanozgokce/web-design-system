'use client';

import { useState } from 'react';
import { CopyButton } from '@/registry/ds/ui/copy-button';

const invoices = [
  { number: 'INV-2041', customer: 'Northwind Traders', amount: '€1,240.00' },
  { number: 'INV-2042', customer: 'Lindqvist & Berg', amount: '€380.50' },
  { number: 'INV-2043', customer: 'Harbor Coffee Co.', amount: '€96.00' },
];

export default function CopyButtonTable() {
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      <ul className="divide-y divide-outline-variant rounded-md border border-outline-variant">
        {invoices.map((invoice) => (
          <li key={invoice.number} className="flex items-center gap-3 py-2 ps-4 pe-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-md text-on-surface">{invoice.customer}</span>
              <span className="flex items-center gap-1 font-mono text-body-sm text-on-surface-variant">
                {invoice.number}
                <CopyButton
                  value={invoice.number}
                  size="xs"
                  aria-label={`Copy invoice number ${invoice.number}`}
                  onCopy={setLastCopied}
                />
              </span>
            </div>
            <span className="text-body-md text-on-surface tabular-digits">{invoice.amount}</span>
          </li>
        ))}
      </ul>
      <p className="text-body-sm text-on-surface-variant">
        {lastCopied ? `Last copied: ${lastCopied}` : 'Nothing copied yet'}
      </p>
    </div>
  );
}
