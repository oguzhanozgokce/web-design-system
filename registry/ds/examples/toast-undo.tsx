'use client';

import { useState } from 'react';
import { ArchiveIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast } from '@/registry/ds/ui/toast';

interface Order {
  id: string;
  customer: string;
}

const allOrders: Order[] = [
  { id: 'ORD-1042', customer: 'Acme Corp' },
  { id: 'ORD-1043', customer: 'Globex' },
  { id: 'ORD-1044', customer: 'Initech' },
];

export default function ToastUndo() {
  const [orders, setOrders] = useState(allOrders);

  function archive(order: Order) {
    setOrders((current) => current.filter((item) => item.id !== order.id));
    toast(`${order.id} archived`, {
      toasterId: 'toast-undo',
      action: {
        label: 'Undo',
        onAction: () =>
          setOrders((current) =>
            allOrders.filter(
              (item) => item.id === order.id || current.some((kept) => kept.id === item.id),
            ),
          ),
      },
    });
  }

  return (
    <div className="w-full max-w-sm">
      {orders.length ? (
        <ul className="divide-y divide-outline-variant rounded-lg bg-surface-container-low text-on-surface">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center gap-3 py-2 ps-4 pe-2">
              <div className="min-w-0 flex-1">
                <p className="text-title-sm">{order.id}</p>
                <p className="text-body-sm text-on-surface-variant">{order.customer}</p>
              </div>
              <Button
                variant="text"
                size="sm"
                startIcon={<ArchiveIcon />}
                aria-label={`Archive ${order.id}`}
                onPress={() => archive(order)}
              >
                Archive
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-surface-container-low p-4 text-center text-body-md text-on-surface-variant">
          Every order is archived.
        </p>
      )}
      <Toaster toasterId="toast-undo" />
    </div>
  );
}
