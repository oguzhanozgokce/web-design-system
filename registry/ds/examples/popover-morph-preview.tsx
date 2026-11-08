'use client';

import { useState } from 'react';
import { BookmarkIcon, CheckIcon, CloseIcon, ImageIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { IconButton } from '@/registry/ds/ui/icon-button';
import { Popover, PopoverPreviewTrigger } from '@/registry/ds/ui/popover';

export default function PopoverMorphPreview() {
  const [isOpen, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex min-h-64 w-full max-w-sm flex-col items-center justify-center gap-5 text-center">
      <div>
        <p className="mb-1 text-xs font-medium text-on-surface-variant">A SMALL ESCAPE</p>
        <p className="text-lg font-semibold tracking-tight text-on-surface">
          Something worth a closer look.
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Peek inside without leaving your place.
        </p>
      </div>
      <PopoverPreviewTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <Button variant="soft" startIcon={<ImageIcon />} onPress={() => setOpen(true)}>
          The slow collection
        </Button>
        <Popover animation="morph" placement="bottom" aria-label="The slow collection">
          <div className="w-80 max-w-[calc(100vw-1.5rem)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-on-surface">The slow collection</h3>
              <IconButton
                aria-label="Close preview"
                icon={<CloseIcon />}
                size="xs"
                onPress={() => setOpen(false)}
              />
            </div>
            <img
              src="/samples/lagoon.jpg"
              alt="An abstract lagoon in soft blue and green"
              width={320}
              height={128}
              draggable={false}
              className="mb-3 h-28 w-full rounded-item object-cover"
            />
            <p className="text-sm text-on-surface-variant">
              Four quiet scenes for a fresh perspective. Made for the moments between everything
              else.
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-on-surface-variant">4 original scenes</span>
              <Button
                variant={saved ? 'soft' : 'solid'}
                startIcon={saved ? <CheckIcon /> : <BookmarkIcon />}
                onPress={() => setSaved((value) => !value)}
              >
                {saved ? 'Saved' : 'Save collection'}
              </Button>
            </div>
          </div>
        </Popover>
      </PopoverPreviewTrigger>
      <p className="text-xs text-on-surface-variant">Hover or focus to preview. Tap to open.</p>
    </div>
  );
}
