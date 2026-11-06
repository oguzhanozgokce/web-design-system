'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'react-aria-components';
import { RefreshIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ContentState } from '@/registry/ds/ui/content-state';

interface Invoice {
  id: string;
  customer: string;
  amount: number;
}

const invoices: Invoice[] = [
  { id: 'INV-2048', customer: 'Acme Corp', amount: 4280 },
  { id: 'INV-2049', customer: 'Globex Corporation', amount: 1150.5 },
  { id: 'INV-2050', customer: 'Initech', amount: 920 },
];

function fetchInvoices(shouldFail: boolean) {
  return new Promise<Invoice[]>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('Request timed out'));
      else resolve(invoices);
    }, 1200);
  });
}

export default function ContentStateDemo() {
  const { locale } = useLocale();
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
  const [data, setData] = useState<Invoice[]>();
  const [error, setError] = useState<unknown>();
  const [isRefreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvoices(true).then(setData, setError);
  }, []);

  async function load() {
    try {
      setData(await fetchInvoices(false));
      setError(undefined);
    } catch (reason) {
      setError(reason);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <section className="w-full max-w-lg rounded-lg border border-outline-variant bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-outline-variant py-2 ps-4 pe-2">
        <h3 className="text-title-sm text-on-surface">Open invoices</h3>
        <Button
          variant="text"
          size="sm"
          startIcon={<RefreshIcon />}
          isDisabled={data === undefined}
          onPress={refresh}
        >
          Refresh
        </Button>
      </div>
      <ContentState
        data={data}
        error={error}
        isRefreshing={isRefreshing}
        onRetry={load}
        headingLevel={4}
        loadingLabel="Loading invoices"
        className="p-2"
      >
        {(items) => (
          <ul className="flex flex-col">
            {items.map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between gap-4 px-2 py-3">
                <div>
                  <p className="text-title-sm text-on-surface">{invoice.id}</p>
                  <p className="text-body-sm text-on-surface-variant">{invoice.customer}</p>
                </div>
                <span className="text-body-md text-on-surface tabular-digits">
                  {currency.format(invoice.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ContentState>
    </section>
  );
}
