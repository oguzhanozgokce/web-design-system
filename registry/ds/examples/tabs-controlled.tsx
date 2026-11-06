'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { Tab, TabList, TabPanel, Tabs } from '@/registry/ds/ui/tabs';

const steps = [
  { id: 'company', label: 'Company', body: 'Legal name, tax number and registered address.' },
  { id: 'team', label: 'Team', body: 'Invite the people who approve invoices.' },
  { id: 'billing', label: 'Billing', body: 'Choose how your customers pay you.' },
];

export default function TabsControlled() {
  const [selected, setSelected] = useState<Key>('company');
  const index = steps.findIndex((step) => step.id === selected);
  const next = steps[index + 1];

  return (
    <Tabs
      fullWidth
      selectedKey={selected}
      onSelectionChange={setSelected}
      className="w-full max-w-md"
    >
      <TabList aria-label="Workspace setup" items={steps}>
        {(step) => <Tab id={step.id}>{step.label}</Tab>}
      </TabList>
      {steps.map((step) => (
        <TabPanel key={step.id} id={step.id} className="flex flex-col items-start gap-4">
          <p className="text-body-md text-on-surface-variant">{step.body}</p>
          {next ? (
            <Button size="sm" onPress={() => setSelected(next.id)}>
              Continue to {next.label.toLowerCase()}
            </Button>
          ) : (
            <Button size="sm" variant="tonal" onPress={() => setSelected('company')}>
              Review from the start
            </Button>
          )}
        </TabPanel>
      ))}
    </Tabs>
  );
}
