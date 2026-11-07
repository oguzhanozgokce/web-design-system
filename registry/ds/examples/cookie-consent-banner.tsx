'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { CookieConsent } from '@/registry/ds/ui/cookie-consent';

export default function CookieConsentBanner() {
  const [isOpen, setOpen] = useState(true);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <CookieConsent
        layout="banner"
        title="A little clarity about cookies."
        description="Use the essentials, or allow optional cookies to help us improve your visits."
        categories={[
          {
            id: 'essential',
            label: 'Essential',
            description: 'Keeps this website working.',
            isRequired: true,
          },
          {
            id: 'analytics',
            label: 'Usage analytics',
            description: 'Understand visits and improve the experience.',
          },
        ]}
        isOpen={isOpen}
        onOpenChange={setOpen}
        onConfirm={() => undefined}
      />
      {!isOpen ? (
        <Button variant="outline" onPress={() => setOpen(true)}>
          Review choices
        </Button>
      ) : null}
    </div>
  );
}
