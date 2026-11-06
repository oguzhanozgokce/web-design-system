'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

const sections = [
  {
    id: 'new',
    title: 'New',
    body: 'A dark theme, offline mode and a faster search.',
  },
  {
    id: 'improved',
    title: 'Improved',
    body: 'Pages load twice as fast on slow connections, and lists remember where you scrolled to.',
  },
  {
    id: 'fixed',
    title: 'Fixed',
    body: 'Signing in no longer fails right after a password change.',
  },
];

const allKeys = sections.map((section) => section.id);

export default function DisclosureControlled() {
  const [expanded, setExpanded] = useState<Set<Key>>(new Set(['new']));
  const allOpen = expanded.size === allKeys.length;

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md text-on-surface">What’s new in 2.4</h2>
        <Button
          variant="text"
          size="sm"
          onPress={() => setExpanded(new Set(allOpen ? [] : allKeys))}
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>
      <Accordion allowsMultipleExpanded expandedKeys={expanded} onExpandedChange={setExpanded}>
        {sections.map((section) => (
          <Disclosure key={section.id} id={section.id}>
            <DisclosureTrigger>{section.title}</DisclosureTrigger>
            <DisclosurePanel>{section.body}</DisclosurePanel>
          </Disclosure>
        ))}
      </Accordion>
    </div>
  );
}
