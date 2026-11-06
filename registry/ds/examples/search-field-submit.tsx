'use client';

import { useState } from 'react';
import { SearchField } from '@/registry/ds/ui/search-field';

const orders = ['ORD-7731', 'ORD-7732', 'ORD-7740', 'ORD-8102'];

export default function SearchFieldSubmit() {
  const [result, setResult] = useState('Search by order number, then press Enter.');

  async function lookUp(query: string) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const match = orders.find((order) => order.toLowerCase() === query.trim().toLowerCase());
    setResult(match ? `${match} shipped on 4 November.` : `No order matches “${query}”.`);
  }

  return (
    <div className="grid w-full max-w-sm gap-3">
      <SearchField label="Order lookup" placeholder="ORD-7731" onSubmit={lookUp} />
      <p className="text-body-md text-on-surface-variant" aria-live="polite">
        {result}
      </p>
    </div>
  );
}
