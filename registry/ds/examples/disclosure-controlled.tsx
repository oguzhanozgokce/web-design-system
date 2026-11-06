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
    id: 'items',
    title: 'Items',
    body: 'Linen shirt (M) × 1, canvas tote × 2, gift wrap × 1. Subtotal £96.00.',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    body: 'Tracked delivery to 14 Harbour Street, Leeds. Dispatched on 4 November, arriving Thursday.',
  },
  {
    id: 'payment',
    title: 'Payment',
    body: 'Paid by Visa ending 4242 on 3 November. Receipt sent to the customer.',
  },
];

const allKeys = sections.map((section) => section.id);

export default function DisclosureControlled() {
  const [expanded, setExpanded] = useState<Set<Key>>(new Set(['items']));
  const allOpen = expanded.size === allKeys.length;

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md text-on-surface">Order ORD-10482</h2>
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
