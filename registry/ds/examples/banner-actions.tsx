'use client';

import { useState } from 'react';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

export default function BannerActions() {
  const [attempts, setAttempts] = useState(0);

  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <Banner
        tone="error"
        title="Bank sync paused"
        description="We could not reach your bank since 09:14. New payments will not be matched to invoices until it reconnects."
        actions={
          <>
            <Button
              onPress={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setAttempts((count) => count + 1);
              }}
            >
              Retry now
            </Button>
            <Button>Reconnect bank</Button>
          </>
        }
      />
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {attempts === 0 ? 'Not retried yet' : `Retries: ${attempts}`}
      </p>
    </div>
  );
}
