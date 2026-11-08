'use client';

import { useState } from 'react';
import { CheckIcon, TuneIcon } from '@/registry/ds/lib/icons';
import { Button } from '@/registry/ds/ui/button';
import { Popover, PopoverDialog, PopoverTrigger } from '@/registry/ds/ui/popover';
import { Switch } from '@/registry/ds/ui/switch';

export default function PopoverMorph() {
  const [quiet, setQuiet] = useState(true);
  const [previews, setPreviews] = useState(false);

  return (
    <div className="flex min-h-64 w-full max-w-sm flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-12 items-center justify-center rounded-container bg-primary-soft text-on-primary-soft">
        <TuneIcon className="size-6" />
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tight text-on-surface">
          A little room to focus.
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Small adjustments. A calmer workspace.
        </p>
      </div>
      <PopoverTrigger>
        <Button variant="outline" startIcon={<TuneIcon />}>
          Preferences
        </Button>
        <Popover animation="morph" placement="bottom">
          <PopoverDialog title="Make it feel like you" showCloseButton className="w-80">
            {({ close }) => (
              <>
                <p className="mb-4 text-xs">Your preferences stay with this workspace.</p>
                <div className="space-y-4">
                  <Switch
                    isSelected={quiet}
                    onChange={setQuiet}
                    description="Pause non-essential notifications."
                  >
                    Quiet mode
                  </Switch>
                  <Switch
                    isSelected={previews}
                    onChange={setPreviews}
                    description="See a glimpse before opening a file."
                  >
                    Show previews
                  </Switch>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-subtle pt-4">
                  <Button
                    variant="ghost"
                    onPress={() => {
                      setQuiet(true);
                      setPreviews(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button variant="solid" startIcon={<CheckIcon />} onPress={close}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
      <p className="text-xs text-on-surface-variant" role="status">
        {quiet ? 'Quiet mode on' : 'Notifications on'} · {previews ? 'Previews on' : 'Previews off'}
      </p>
    </div>
  );
}
