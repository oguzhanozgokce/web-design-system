'use client';

import { useLocale } from 'react-aria-components';
import { UploadIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/registry/ds/ui/dialog';

const files = Array.from({ length: 24 }, (_, index) => ({
  name: `IMG_${4100 + index}.jpg`,
  size: 1.2 + ((index * 0.7) % 4.6),
  day: (index % 28) + 1,
}));

export default function DialogScrollable() {
  const { locale } = useLocale();
  const size = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 1,
  });
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });

  return (
    <DialogTrigger>
      <Button variant="outline" startIcon={<UploadIcon />}>
        Upload photos
      </Button>
      <Dialog>
        <DialogHeader
          title="Upload 24 photos?"
          description="Check the list before the photos are added to your library."
        />
        <DialogBody>
          <ul className="divide-y divide-outline-subtle">
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between gap-4 py-3">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-base text-on-surface">{file.name}</span>
                  <span className="text-xs text-on-surface-variant">
                    {date.format(new Date(2026, 2, file.day))}
                  </span>
                </span>
                <span className="text-sm text-on-surface-variant tabular-digits">
                  {size.format(file.size)}
                </span>
              </li>
            ))}
          </ul>
        </DialogBody>
        <DialogFooter>
          <Button slot="close" variant="soft">
            Cancel
          </Button>
          <Button slot="close">Upload 24</Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
