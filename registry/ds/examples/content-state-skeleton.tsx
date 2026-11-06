'use client';

import { useState } from 'react';
import { RefreshIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { ContentState } from '@/registry/ds/ui/content-state';
import { Skeleton } from '@/registry/ds/ui/skeleton';

const contacts = [
  { name: 'Ayşe Demir', email: 'ayse@example.com' },
  { name: 'Jonas Weber', email: 'jonas@example.com' },
  { name: 'Priya Natarajan', email: 'priya@example.com' },
];

function ContactSkeleton() {
  return (
    <div className="flex flex-col">
      {contacts.map((contact) => (
        <div key={contact.name} className="flex items-center gap-3 px-2 py-3">
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
        Reload contacts
      </Button>
      <ContentState
        status={status}
        loadingLabel="Loading contacts"
        loadingContent={<ContactSkeleton />}
        className="rounded-lg border border-outline-variant bg-surface p-2"
      >
        <ul className="flex flex-col">
          {contacts.map((contact) => (
            <li key={contact.name} className="flex items-center gap-3 px-2 py-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary-container text-title-sm text-on-secondary-container">
                {contact.name.charAt(0)}
              </span>
              <span className="flex flex-col">
                <span className="text-title-sm text-on-surface">{contact.name}</span>
                <span className="text-body-sm text-on-surface-variant">{contact.email}</span>
              </span>
            </li>
          ))}
        </ul>
      </ContentState>
    </div>
  );
}
