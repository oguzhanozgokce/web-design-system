'use client';

import { useState } from 'react';
import { NumberField } from '@/registry/ds/ui/number-field';
import { RollingNumber } from '@/registry/ds/ui/rolling-number';

const sizes = [
  { id: 'small', name: '10 × 15 cm', detail: 'Glossy' },
  { id: 'medium', name: '13 × 18 cm', detail: 'Matte' },
  { id: 'large', name: '20 × 30 cm', detail: 'Matte, with a border' },
];

export default function NumberFieldCompactList() {
  const [prints, setPrints] = useState<Record<string, number>>({ small: 12, medium: 4, large: 1 });
  const total = Object.values(prints).reduce(
    (sum, count) => sum + (Number.isFinite(count) ? count : 0),
    0,
  );

  return (
    <div className="flex w-full max-w-sm flex-col rounded-container border border-outline-subtle bg-surface-raised">
      <ul className="flex flex-col divide-y divide-outline-subtle">
        {sizes.map((size) => (
          <li key={size.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-on-surface">{size.name}</span>
              <span className="text-xs text-on-surface-variant">{size.detail}</span>
            </div>
            <NumberField
              aria-label={`Prints, ${size.name}`}
              layout="compact"
              size="sm"
              minValue={0}
              maxValue={500}
              value={prints[size.id]}
              onChange={(count) => setPrints((current) => ({ ...current, [size.id]: count }))}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-4 border-t border-outline-subtle px-4 py-3 text-sm">
        <span className="text-on-surface-variant">Prints in this order</span>
        <RollingNumber value={total} className="font-semibold text-on-surface" />
      </div>
    </div>
  );
}
