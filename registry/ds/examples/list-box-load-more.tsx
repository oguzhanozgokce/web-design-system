'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { ListBox, ListBoxItem } from '@/registry/ds/ui/list-box';

interface Transaction {
  id: number;
  merchant: string;
  amount: number;
}

const merchants = ['Migros', 'Pegasus Airlines', 'Kahve Dünyası', 'Turkcell', 'IKEA', 'Getir'];

function page(start: number): Transaction[] {
  return Array.from({ length: 12 }, (_, index) => {
    const id = start + index;
    return { id, merchant: merchants[id % merchants.length], amount: 42.5 + ((id * 37) % 900) };
  });
}

const total = 60;

export default function ListBoxLoadMore() {
  const { locale } = useLocale();
  const [items, setItems] = useState(() => page(0));
  const [isLoading, setLoading] = useState(false);
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'TRY' });

  function loadMore() {
    if (isLoading || items.length >= total) return;
    setLoading(true);
    setTimeout(() => {
      setItems((current) => [...current, ...page(current.length)]);
      setLoading(false);
    }, 900);
  }

  return (
    <ListBox
      aria-label="Card transactions"
      items={items}
      isLoading={isLoading}
      onLoadMore={loadMore}
      variant="outlined"
      className="h-72 w-full max-w-xs"
    >
      {(transaction) => (
        <ListBoxItem
          textValue={transaction.merchant}
          description={`#${String(transaction.id + 1).padStart(4, '0')}`}
        >
          <span className="flex items-baseline justify-between gap-3">
            <span className="truncate">{transaction.merchant}</span>
            <span className="tabular-digits">{money.format(transaction.amount)}</span>
          </span>
        </ListBoxItem>
      )}
    </ListBox>
  );
}
