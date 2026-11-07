'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { CookieConsent, type CookieConsentCategory } from '@/registry/ds/ui/cookie-consent';

const categories: CookieConsentCategory[] = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Sign-in, security and your saved preferences.',
    isRequired: true,
  },
  {
    id: 'analytics',
    label: 'Usage analytics',
    description: 'Help us understand what works and what could be better.',
  },
  {
    id: 'personalisation',
    label: 'Personalisation',
    description: 'Remember the way you like things.',
  },
];

export default function CookieConsentDemo() {
  const [isOpen, setOpen] = useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <CookieConsent
        title="Your privacy, your call."
        description="Essential cookies keep things working. Anything extra is up to you."
        categories={categories}
        isOpen={isOpen}
        onOpenChange={setOpen}
        onConfirm={() => undefined}
      />
      {!isOpen ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Your choices are saved for this preview.
          </p>
          <Button variant="outline" onPress={() => setOpen(true)}>
            Review choices
          </Button>
        </div>
      ) : null}
    </div>
  );
}
