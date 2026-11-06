'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { ContentState } from '@/registry/ds/ui/content-state';

const payouts = [
  { id: 'PO-311', date: '4 November', status: 'Paid' },
  { id: 'PO-310', date: '28 October', status: 'Paid' },
  { id: 'PO-309', date: '21 October', status: 'Paid' },
];

export default function ContentStateRefreshError() {
  const [error, setError] = useState<Error>();

  return (
    <div className="flex w-full max-w-lg flex-col items-start gap-3">
      <Button
        variant="outlined"
        size="sm"
        isDisabled={error !== undefined}
        onPress={() => setError(new Error('Network unreachable'))}
      >
        Simulate a failed refresh
      </Button>
      <ContentState
        data={payouts}
        error={error}
        onRetry={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          setError(undefined);
        }}
        errorTitle="Couldn’t refresh payouts"
        errorDescription="Showing the list from 09:12. Check your connection and try again."
        className="rounded-lg border border-outline-variant bg-surface p-2"
      >
        {(items) => (
          <ul className="flex flex-col">
            {items.map((payout) => (
              <li
                key={payout.id}
                className="flex items-center justify-between gap-4 px-2 py-3 text-body-md text-on-surface"
              >
                <span>
                  {payout.id} · {payout.date}
                </span>
                <span className="text-on-surface-variant">{payout.status}</span>
              </li>
            ))}
          </ul>
        )}
      </ContentState>
    </div>
  );
}
