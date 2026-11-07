'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { CookieConsent } from '@/registry/ds/ui/cookie-consent';

export default function CookieConsentCompact() {
  const [isOpen, setOpen] = useState(true);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <CookieConsent
        layout="compact"
        title="Small cookies. Clear choices."
        description="Only the essentials, unless you say otherwise."
        categories={[
          {
            id: 'essential',
            label: 'Essential',
            description: 'Sign-in and your privacy choices.',
            isRequired: true,
          },
          { id: 'analytics', label: 'Usage analytics', description: 'Help us improve this site.' },
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
