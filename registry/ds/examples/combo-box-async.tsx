'use client';

import { useEffect, useRef, useState } from 'react';
import { SearchIcon } from '@/registry/ds/lib/icons';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

interface Customer {
  id: string;
  name: string;
  email: string;
}

const directory: Customer[] = [
  { id: 'cus_1', name: 'Northwind Traders', email: 'billing@northwind.com' },
  { id: 'cus_2', name: 'Harbor & Co', email: 'finance@harbor.co' },
  { id: 'cus_3', name: 'Anadolu Gıda', email: 'muhasebe@anadolugida.com.tr' },
  { id: 'cus_4', name: 'Lisbon Labs', email: 'ap@lisbonlabs.pt' },
  { id: 'cus_5', name: 'Kestrel Logistics', email: 'invoices@kestrel.io' },
  { id: 'cus_6', name: 'Bosphorus Tech', email: 'odeme@bosphorus.tech' },
  { id: 'cus_7', name: 'Nordlicht GmbH', email: 'rechnung@nordlicht.de' },
];

function searchCustomers(query: string, signal: AbortSignal) {
  return new Promise<Customer[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLocaleLowerCase();
      resolve(
        directory.filter(
          (customer) =>
            customer.name.toLocaleLowerCase().includes(needle) || customer.email.includes(needle),
        ),
      );
    }, 700);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

export default function ComboBoxAsync() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setLoading] = useState(true);
  const latest = useRef<AbortController | null>(null);

  useEffect(() => {
    latest.current?.abort();
    const controller = new AbortController();
    latest.current = controller;
    searchCustomers(query, controller.signal).then(
      (results) => {
        setCustomers(results);
        setLoading(false);
      },
      () => undefined,
    );
    return () => controller.abort();
  }, [query]);

  return (
    <ComboBox
      label="Bill to"
      placeholder="Search customers"
      items={customers}
      isLoading={isLoading}
      onInputChange={(value) => {
        setLoading(true);
        setQuery(value);
      }}
      startAdornment={<SearchIcon />}
      className="w-full max-w-xs"
    >
      {(customer) => (
        <ListBoxItem textValue={customer.name} description={customer.email}>
          {customer.name}
        </ListBoxItem>
      )}
    </ComboBox>
  );
}
