'use client';

import { useState } from 'react';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

export default function BannerPage() {
  const [isOpen, setOpen] = useState(true);

  return (
    <div className="w-full overflow-hidden rounded-container border border-outline-subtle bg-canvas">
      <Banner
        layout="page"
        tone="info"
        isDismissable
        isOpen={isOpen}
        onOpenChange={setOpen}
        description="Scheduled maintenance on Sunday from 02:00 to 04:00 UTC. Some features may be unavailable during this window."
        actions={<Button>View status page</Button>}
      />
      <div className="flex flex-col items-start gap-2 p-6">
        <p className="text-xl font-semibold tracking-tight text-on-surface">Projects</p>
        <p className="text-sm text-on-surface-variant">
          12 active · 3 shared with you · 28 archived
        </p>
        {isOpen ? null : (
          <Button variant="ghost" size="sm" className="-ms-3" onPress={() => setOpen(true)}>
            Show the maintenance notice
          </Button>
        )}
      </div>
    </div>
  );
}
