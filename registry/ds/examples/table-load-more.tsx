'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'react-aria-components';
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableLoadMore,
} from '@/registry/ds/ui/table';

const places = [
  'Lisbon',
  'Nairobi',
  'Kyoto',
  'Oslo',
  'Lima',
  'Seoul',
  'Accra',
  'Hanoi',
  'Quito',
  'Tbilisi',
  'Perth',
  'Bergen',
  'Cusco',
  'Busan',
  'Dakar',
  'Porto',
  'Hobart',
  'Leipzig',
];

function visitsFor(index: number) {
  return (((index + 3) * 7919) % 9000) + 400;
}

export default function TableLoadMoreExample() {
  const { locale } = useLocale();
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [count, setCount] = useState(8);
  const [isLoading, setLoading] = useState(false);
  const rows = places.slice(0, count).map((place, index) => ({
    id: place,
    place,
    visits: visitsFor(index),
  }));

  function loadMore() {
    if (isLoading || count >= places.length) return;
    setLoading(true);
    setTimeout(() => {
      setCount((current) => Math.min(current + 6, places.length));
      setLoading(false);
    }, 800);
  }

  return (
    <div className="w-full max-w-md rounded-container border border-outline-subtle bg-surface-raised p-2">
      <Table aria-label="Visits by city" stickyHeader containerClassName="max-h-72">
        <TableHeader>
          <Column isRowHeader>City</Column>
          <Column align="end">Visits</Column>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} id={row.id}>
              <Cell className="font-medium">{row.place}</Cell>
              <Cell align="end" className="tabular-digits">
                {number.format(row.visits)}
              </Cell>
            </Row>
          ))}
          {count < places.length ? (
            <TableLoadMore isLoading={isLoading} onLoadMore={loadMore} />
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
