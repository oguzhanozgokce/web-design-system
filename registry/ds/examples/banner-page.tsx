'use client';

import { useState } from 'react';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

export default function BannerPage() {
  const [isOpen, setOpen] = useState(true);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-outline-variant bg-surface">
      <Banner
        layout="page"
        tone="info"
        isDismissable
        isOpen={isOpen}
        onOpenChange={setOpen}
        description="Scheduled maintenance on Sunday 10 November from 02:00 to 04:00 UTC. Invoices can’t be sent during this window."
        actions={<Button>View status page</Button>}
      />
      <div className="flex flex-col items-start gap-2 p-6">
        <p className="text-title-lg text-on-surface">Invoices</p>
        <p className="text-body-md text-on-surface-variant">
          38 open · 4 overdue · 212 paid this year
        </p>
        {isOpen ? null : (
          <Button variant="text" size="sm" className="-ms-3.5" onPress={() => setOpen(true)}>
            Show the maintenance notice
          </Button>
        )}
      </div>
    </div>
  );
}
