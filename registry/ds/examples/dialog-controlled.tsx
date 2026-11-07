'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/registry/ds/ui/dialog';

const files = [
  { name: 'Notes.txt', kind: 'Plain text', size: 0.1, modified: new Date(2026, 9, 2) },
  { name: 'Photo.jpg', kind: 'JPEG image', size: 3.2, modified: new Date(2026, 9, 14) },
  { name: 'Slides.pdf', kind: 'PDF document', size: 8.4, modified: new Date(2026, 9, 21) },
];

export default function DialogControlled() {
  const { locale } = useLocale();
  const size = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 1,
  });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState(files[0]);

  return (
    <>
      <ul className="w-full max-w-md divide-y divide-outline-subtle rounded-container border border-outline-subtle bg-surface-raised px-4 text-on-surface">
        {files.map((file) => (
          <li key={file.name} className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-base">{file.name}</span>
              <span className="text-xs text-on-surface-variant">{file.kind}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Details for ${file.name}`}
              onPress={() => {
                setSelected(file);
                setOpen(true);
              }}
            >
              Details
            </Button>
          </li>
        ))}
      </ul>
      <Dialog size="sm" isOpen={isOpen} onOpenChange={setOpen}>
        <DialogHeader title={selected.name} description={selected.kind} />
        <DialogBody>
          <dl className="grid grid-cols-2 gap-y-2">
            <dt>Size</dt>
            <dd className="text-end text-on-surface tabular-digits">
              {size.format(selected.size)}
            </dd>
            <dt>Modified</dt>
            <dd className="text-end text-on-surface">{date.format(selected.modified)}</dd>
          </dl>
        </DialogBody>
        <DialogFooter>
          <Button slot="close">Done</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
