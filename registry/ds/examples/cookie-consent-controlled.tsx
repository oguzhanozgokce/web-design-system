'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import {
  CookieConsent,
  type CookieConsentDecision,
  type CookieConsentValue,
} from '@/registry/ds/ui/cookie-consent';

export default function CookieConsentControlled() {
  const [isOpen, setOpen] = useState(true);
  const [draft, setDraft] = useState<CookieConsentValue>({ analytics: false });
  const [saved, setSaved] = useState<CookieConsentDecision | null>(null);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <CookieConsent
        title="Choose what you share."
        description="Change a preference, then save when you are ready."
        categories={[
          { id: 'essential', label: 'Essential', isRequired: true },
          {
            id: 'analytics',
            label: 'Usage analytics',
            description: 'Optional insights about this website.',
          },
        ]}
        value={draft}
        onChange={setDraft}
        isOpen={isOpen}
        onOpenChange={setOpen}
        onConfirm={(decision) => setSaved(decision)}
      />
      {saved ? (
        <p role="status" className="text-sm text-on-surface-variant">
          {saved.value.analytics ? 'Usage analytics allowed.' : 'Optional cookies are off.'}
        </p>
      ) : null}
      {!isOpen ? (
        <Button variant="outline" onPress={() => setOpen(true)}>
          Review choices
        </Button>
      ) : null}
    </div>
  );
}
