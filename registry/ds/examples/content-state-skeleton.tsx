'use client';

import { useState } from 'react';
import { RefreshIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ContentState } from '@/registry/ds/ui/content-state';
import { Skeleton } from '@/registry/ds/ui/skeleton';

const customers = [
  { name: 'Acme Corp', email: 'billing@acme.example' },
  { name: 'Globex Corporation', email: 'ap@globex.example' },
  { name: 'Initech', email: 'finance@initech.example' },
];

function CustomerSkeleton() {
  return (
    <div className="flex flex-col">
      {customers.map((customer) => (
        <div key={customer.name} className="flex items-center gap-3 px-2 py-3">
          <Skeleton shape="circle" />
          <div className="flex flex-1 flex-col">
            <Skeleton shape="text" className="w-1/3 text-title-sm" />
            <Skeleton shape="text" className="w-1/2 text-body-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ContentStateSkeleton() {
  const [status, setStatus] = useState<'loading' | 'content'>('content');

  return (
    <div className="flex w-full max-w-lg flex-col items-end gap-2">
      <Button
        variant="text"
        size="sm"
        startIcon={<RefreshIcon />}
        isDisabled={status === 'loading'}
        onPress={() => {
          setStatus('loading');
          setTimeout(() => setStatus('content'), 1800);
        }}
      >
        Reload customers
      </Button>
      <ContentState
        status={status}
        loadingLabel="Loading customers"
        loadingContent={<CustomerSkeleton />}
        className="rounded-lg border border-outline-variant bg-surface p-2"
      >
        <ul className="flex flex-col">
          {customers.map((customer) => (
            <li key={customer.name} className="flex items-center gap-3 px-2 py-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary-container text-title-sm text-on-secondary-container">
                {customer.name.charAt(0)}
              </span>
              <span className="flex flex-col">
                <span className="text-title-sm text-on-surface">{customer.name}</span>
                <span className="text-body-sm text-on-surface-variant">{customer.email}</span>
              </span>
            </li>
          ))}
        </ul>
      </ContentState>
    </div>
  );
}
