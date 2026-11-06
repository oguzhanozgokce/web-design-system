'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Toaster, toast, type ToastPlacement } from '@/registry/ds/ui/toast';

const toasterId = 'toast-placement';

const placements: ToastPlacement[] = [
  'top-start',
  'top-center',
  'top-end',
  'bottom-start',
  'bottom-center',
  'bottom-end',
];

export default function ToastPlacementExample() {
  const [placement, setPlacement] = useState<ToastPlacement>('bottom-end');

  return (
    <div className="grid grid-flow-col grid-rows-3 gap-2 sm:grid-flow-row sm:grid-cols-3 sm:grid-rows-none">
      {placements.map((value) => (
        <Button
          key={value}
          size="sm"
          variant={value === placement ? 'tonal' : 'outlined'}
          onPress={() => {
            setPlacement(value);
            toast(`Shown at ${value}`, { toasterId });
          }}
        >
          {value}
        </Button>
      ))}
      <Toaster toasterId={toasterId} placement={placement} />
    </div>
  );
}
