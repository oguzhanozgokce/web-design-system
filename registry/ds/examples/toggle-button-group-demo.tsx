'use client';

import { useState } from 'react';
import { useLocale, type Key } from 'react-aria-components';
import { ToggleButton, ToggleButtonGroup } from '@/registry/ds/ui/toggle-button';

const periods = [
  { id: 'week', label: 'Week', revenue: 8915 },
  { id: 'month', label: 'Month', revenue: 36402 },
  { id: 'year', label: 'Year', revenue: 418260 },
];

export default function ToggleButtonGroupDemo() {
  const { locale } = useLocale();
  const [selected, setSelected] = useState<Set<Key>>(new Set(['week']));
  const period = periods.find((item) => selected.has(item.id)) ?? periods[0];
  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <ToggleButtonGroup
        aria-label="Revenue period"
        disallowEmptySelection
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        {periods.map((item) => (
          <ToggleButton key={item.id} id={item.id}>
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <p className="text-body-md text-on-surface-variant" aria-live="polite">
        Revenue this {period.label.toLowerCase()}:{' '}
        <span className="text-title-sm text-on-surface">{currency.format(period.revenue)}</span>
      </p>
    </div>
  );
}
