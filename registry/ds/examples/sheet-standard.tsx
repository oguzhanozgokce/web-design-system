'use client';

import { useState } from 'react';
import { CheckCircleIcon, ScheduleIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Sheet, SheetBody, SheetHeader } from '@/registry/ds/ui/sheet';

const uploads = [
  { name: 'Photo.jpg', done: true },
  { name: 'Video.mp4', done: true },
  { name: 'Notes.txt', done: false },
];

export default function SheetStandard() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Button
        variant="tonal"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'upload-progress' : undefined}
        onPress={() => setOpen(!isOpen)}
      >
        {isOpen ? 'Hide uploads' : 'Show uploads'}
      </Button>
      <p className="max-w-xs text-body-sm text-on-surface-variant">
        The panel stays open while you keep using the page.
      </p>
      <Sheet
        id="upload-progress"
        side="bottom"
        size="sm"
        variant="standard"
        isOpen={isOpen}
        onOpenChange={setOpen}
      >
        <SheetHeader title="Uploads" description="2 of 3 complete" />
        <SheetBody>
          <ol className="flex flex-col gap-3">
            {uploads.map((upload) => (
              <li key={upload.name} className="flex items-center gap-3">
                {upload.done ? (
                  <CheckCircleIcon className="size-5 shrink-0 text-primary" />
                ) : (
                  <ScheduleIcon className="size-5 shrink-0 text-on-surface-variant" />
                )}
                <span className={upload.done ? 'text-on-surface' : 'text-on-surface-variant'}>
                  {upload.name}
                </span>
              </li>
            ))}
          </ol>
        </SheetBody>
      </Sheet>
    </div>
  );
}
