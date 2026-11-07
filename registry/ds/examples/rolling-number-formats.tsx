'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

const rows: { label: string; values: number[]; formatOptions?: Intl.NumberFormatOptions }[] = [
  { label: 'Photos', values: [1284, 1312, 998] },
  {
    label: 'Storage used',
    values: [3.2, 3.45, 12.8],
    formatOptions: { style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 },
  },
  { label: 'Upload', values: [0.42, 0.87, 1], formatOptions: { style: 'percent' } },
  {
    label: 'App price',
    values: [4.99, 5.49, 0.99],
    formatOptions: { style: 'currency', currency: 'EUR' },
  },
  {
    label: 'Since yesterday',
    values: [-2.5, 1.5, 12],
    formatOptions: { style: 'unit', unit: 'celsius', signDisplay: 'exceptZero' },
  },
];

export default function RollingNumberFormats() {
  const [set, setSet] = useState(0);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-on-surface-variant">{row.label}</dt>
            <dd className="text-end font-medium text-on-surface">
              <RollingNumber value={row.values[set]} formatOptions={row.formatOptions} />
            </dd>
          </div>
        ))}
      </dl>
      <Button
        variant="soft"
        size="sm"
        className="self-start"
        onPress={() => setSet((current) => (current + 1) % 3)}
      >
        Next values
      </Button>
    </div>
  );
}
