'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { CookieConsent, type CookieConsentPlacement } from '@/registry/ds/ui/cookie-consent';
import { SegmentedControl, SegmentedControlItem } from '@/registry/ds/ui/segmented-control';

export default function CookieConsentPlacement() {
  const [isOpen, setOpen] = useState(false);
  const [placement, setPlacement] = useState<CookieConsentPlacement>('bottom-end');

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <SegmentedControl
        aria-label="Notice placement"
        selectedKeys={[placement]}
        onSelectionChange={(keys) => {
          const [next] = keys;
          if (next === 'bottom-start' || next === 'bottom' || next === 'bottom-end')
            setPlacement(next);
        }}
      >
        <SegmentedControlItem id="bottom-start">Start</SegmentedControlItem>
        <SegmentedControlItem id="bottom">Centre</SegmentedControlItem>
        <SegmentedControlItem id="bottom-end">End</SegmentedControlItem>
      </SegmentedControl>
      <Button variant="outline" onPress={() => setOpen(true)}>
        Preview floating notice
      </Button>
      <p className="text-xs text-on-surface-variant">
        The notice appears at the edge of this page.
      </p>
      <CookieConsent
        placement={placement}
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Cookies, on your terms."
        description="Choose the essentials, or make a little room for more."
        categories={[
          {
            id: 'essential',
            label: 'Essential',
            description: 'Security and your saved choices.',
            isRequired: true,
          },
          {
            id: 'analytics',
            label: 'Usage analytics',
            description: 'Optional insights to improve the site.',
          },
        ]}
        onConfirm={() => undefined}
      />
    </div>
  );
}
