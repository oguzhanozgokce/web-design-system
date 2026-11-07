'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { CookieConsent } from '@/registry/ds/ui/cookie-consent';
import { Switch } from '@/registry/ds/ui/switch';

export default function CookieConsentAsync() {
  const [isOpen, setOpen] = useState(true);
  const [shouldFail, setShouldFail] = useState(true);

  async function save() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (shouldFail) throw new Error('Preview save failure');
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Switch
        isSelected={shouldFail}
        onChange={setShouldFail}
        description="Turn this off to let the next save succeed."
      >
        Simulate a save error
      </Switch>
      <CookieConsent
        title="Make yourself at home."
        description="Choose which cookies you are comfortable with."
        isOpen={isOpen}
        onOpenChange={setOpen}
        onConfirm={save}
      />
      {!isOpen ? (
        <Button variant="outline" onPress={() => setOpen(true)}>
          Review choices
        </Button>
      ) : null}
    </div>
  );
}
