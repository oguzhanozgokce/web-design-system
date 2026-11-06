'use client';

import { useState } from 'react';
import { Banner } from '@/registry/ds/ui/banner';
import { Button } from '@/registry/ds/ui/button';

export default function BannerDismissable() {
  const [isOpen, setOpen] = useState(true);

  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-3">
      <Banner
        tone="neutral"
        isDismissable
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="New: dark mode"
        description="Switch themes in Settings, or let the app follow your system setting."
        actions={<Button>Open settings</Button>}
      />
      <Button variant="outlined" size="sm" isDisabled={isOpen} onPress={() => setOpen(true)}>
        Show announcement again
      </Button>
    </div>
  );
}
