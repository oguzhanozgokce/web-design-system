'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/registry/ds/ui/dialog';

const receipts = [
  { id: 'RC-1042', merchant: 'Northwind Supplies', amount: 1250, category: 'Office' },
  { id: 'RC-1043', merchant: 'Tailspin Travel', amount: 486.4, category: 'Travel' },
  { id: 'RC-1044', merchant: 'Contoso Cloud', amount: 92, category: 'Software' },
];

export default function DialogControlled() {
  const { locale } = useLocale();
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState(receipts[0]);

  return (
    <>
      <ul className="w-full max-w-md divide-y divide-outline-variant rounded-lg bg-surface-container-low px-4 text-on-surface">
        {receipts.map((receipt) => (
          <li key={receipt.id} className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-body-lg">{receipt.merchant}</span>
              <span className="text-body-sm text-on-surface-variant">{receipt.id}</span>
            </span>
            <Button
              variant="text"
              size="sm"
              aria-label={`View ${receipt.id}`}
              onPress={() => {
                setSelected(receipt);
                setOpen(true);
              }}
            >
              View
            </Button>
          </li>
        ))}
      </ul>
      <Dialog size="sm" isOpen={isOpen} onOpenChange={setOpen}>
        <DialogHeader title={`Receipt ${selected.id}`} description={selected.merchant} />
        <DialogBody>
          <dl className="grid grid-cols-2 gap-y-2">
            <dt>Amount</dt>
            <dd className="text-end text-on-surface tabular-digits">
              {currency.format(selected.amount)}
            </dd>
            <dt>Category</dt>
            <dd className="text-end text-on-surface">{selected.category}</dd>
          </dl>
        </DialogBody>
        <DialogFooter>
          <Button slot="close">Done</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
