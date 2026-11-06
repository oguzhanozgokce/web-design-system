'use client';

import { useState } from 'react';
import type { Key } from 'react-aria-components';
import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const plans = [
  { id: 'starter', name: 'Starter', price: '€0' },
  { id: 'team', name: 'Team', price: '€12 per seat' },
  { id: 'business', name: 'Business', price: '€24 per seat' },
];

export default function ComboBoxControlled() {
  const [plan, setPlan] = useState<Key | null>('team');
  const chosen = plans.find((item) => item.id === plan);

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <ComboBox label="Plan" defaultItems={plans} value={plan} onChange={setPlan}>
        {(item) => <ListBoxItem description={item.price}>{item.name}</ListBoxItem>}
      </ComboBox>
      <p className="text-body-sm text-on-surface-variant" aria-live="polite">
        {chosen
          ? `The workspace moves to ${chosen.name} on the next billing date.`
          : 'Choose a plan for this workspace.'}
      </p>
    </div>
  );
}
