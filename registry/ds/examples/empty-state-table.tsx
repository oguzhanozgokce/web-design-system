'use client';

import { useState } from 'react';
import { FilterIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { EmptyState } from '@/registry/ds/ui/empty-state';

const orders = [
  { id: 'ORD-7781', customer: 'Acme Corp', status: 'Paid' },
  { id: 'ORD-7782', customer: 'Globex', status: 'Refunded' },
  { id: 'ORD-7783', customer: 'Initech', status: 'Paid' },
];

export default function EmptyStateTable() {
  const [isFiltered, setFiltered] = useState(true);
  const rows = isFiltered ? [] : orders;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant bg-surface">
      <table className="w-full text-start text-body-md text-on-surface">
        <caption className="px-4 pt-3 text-start text-title-sm">
          Orders {isFiltered ? '· Status: Disputed' : ''}
        </caption>
        <thead className="text-label-lg text-on-surface-variant">
          <tr className="border-b border-outline-variant">
            <th scope="col" className="px-4 py-3 text-start font-medium">
              Order
            </th>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              Customer
            </th>
            <th scope="col" className="px-4 py-3 text-start font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((order) => (
              <tr key={order.id} className="border-b border-outline-variant last:border-0">
                <td className="px-4 py-3">{order.id}</td>
                <td className="px-4 py-3">{order.customer}</td>
                <td className="px-4 py-3">{order.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>
                <EmptyState
                  size="compact"
                  headingLevel={3}
                  icon={<FilterIcon />}
                  title="No disputed orders"
                  description="No order in the last 90 days has an open dispute."
                  primaryAction={<Button onPress={() => setFiltered(false)}>Clear filter</Button>}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isFiltered ? null : (
        <div className="flex justify-end p-2">
          <Button variant="text" size="sm" onPress={() => setFiltered(true)}>
            Show disputed only
          </Button>
        </div>
      )}
    </div>
  );
}
