'use client';

import { useEffect, useState } from 'react';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

interface Customer {
  id: string;
  name: string;
  city: string;
}

const brands = [
  'Northwind',
  'Harbor',
  'Anadolu',
  'Meridian',
  'Kestrel',
  'Bosphorus',
  'Atlas',
  'Lumen',
];
const trades = ['Traders', 'Logistics', 'Foods', 'Studio', 'Labs', 'Partners'];
const cities = ['İstanbul', 'Lisbon', 'Berlin', 'İzmir', 'Rotterdam', 'Ankara', 'Porto'];
const total = 48;

function fetchCustomers(offset: number) {
  return new Promise<Customer[]>((resolve) => {
    setTimeout(() => {
      resolve(
        Array.from({ length: 12 }, (_, index) => {
          const n = offset + index;
          const brand = n % brands.length;
          const trade = (brand + Math.floor(n / brands.length)) % trades.length;
          return {
            id: `cus_${n + 1}`,
            name: `${brands[brand]} ${trades[trade]}`,
            city: cities[n % cities.length],
          };
        }),
      );
    }, 1000);
  });
}

export default function SelectAsync() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCustomers(0).then((page) => {
      if (!active) return;
      setCustomers(page);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  function loadMore() {
    if (isLoading || customers.length >= total) return;
    setLoading(true);
    fetchCustomers(customers.length).then((page) => {
      setCustomers((current) => [...current, ...page]);
      setLoading(false);
    });
  }

  return (
    <Select
      label="Bill to"
      placeholder="Choose a customer"
      items={customers}
      isLoading={isLoading}
      onLoadMore={loadMore}
      className="w-full max-w-xs"
    >
      {(customer) => <ListBoxItem description={customer.city}>{customer.name}</ListBoxItem>}
    </Select>
  );
}
