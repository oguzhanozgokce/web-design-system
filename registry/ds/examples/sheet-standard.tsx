'use client';

import { useState } from 'react';
import { CheckCircleIcon, ScheduleIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetHeader } from '@/registry/ds/ui/sheet';

const steps = [
  { label: 'Packed at Berlin warehouse', done: true },
  { label: 'Handed to DHL Express', done: true },
  { label: 'Out for delivery', done: false },
];

export default function SheetStandard() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Button
        variant="tonal"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'order-4821-tracker' : undefined}
        onPress={() => setOpen(!isOpen)}
      >
        {isOpen ? 'Hide tracking' : 'Track order 4821'}
      </Button>
      <p className="max-w-xs text-body-sm text-on-surface-variant">
        The tracker stays open while you keep using the page.
      </p>
      <Sheet
        id="order-4821-tracker"
        side="bottom"
        size="sm"
        variant="standard"
        isOpen={isOpen}
        onOpenChange={setOpen}
      >
        <SheetHeader title="Order 4821" description="Arriving this afternoon" />
        <SheetBody>
          <ol className="flex flex-col gap-3">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircleIcon className="size-5 shrink-0 text-primary" />
                ) : (
                  <ScheduleIcon className="size-5 shrink-0 text-on-surface-variant" />
                )}
                <span className={step.done ? 'text-on-surface' : 'text-on-surface-variant'}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </SheetBody>
      </Sheet>
    </div>
  );
}
