'use client';

import { useRef, useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Popover, PopoverDialog } from '@/registry/ds/ui/popover';

export default function PopoverAnchored() {
  const meter = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-title-sm text-on-surface">Storage</p>
          <p className="text-body-sm text-on-surface-variant">41 of 50 GB used</p>
        </div>
        <Button
          variant="text"
          size="sm"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onPress={() => setOpen(true)}
        >
          Details
        </Button>
      </div>
      <div ref={meter} className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
        <div className="h-full w-[82%] rounded-full bg-primary" />
      </div>
      <Popover triggerRef={meter} isOpen={isOpen} onOpenChange={setOpen} showArrow>
        <PopoverDialog title="What uses your storage" showCloseButton>
          <p>Photos and videos take 36 GB. Documents take the remaining 5 GB.</p>
        </PopoverDialog>
      </Popover>
    </div>
  );
}
