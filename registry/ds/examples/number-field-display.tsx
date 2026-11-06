'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { NumberField } from '@/registry/ds/ui/number-field';

const unitPrice = 34;

export default function NumberFieldDisplay() {
  const { locale } = useLocale();
  const [quantity, setQuantity] = useState(1);
  const total = Number.isFinite(quantity) ? quantity * unitPrice : 0;
  const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' });

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 rounded-lg bg-surface-container-low p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-title-md text-on-surface">Linen tote bag</p>
          <p className="text-body-md text-on-surface-variant">
            Natural, {currency.format(unitPrice)} each
          </p>
        </div>
        <p className="text-title-md text-on-surface tabular-digits" aria-live="polite">
          {currency.format(total)}
        </p>
      </div>
      <NumberField
        label="Quantity"
        size="display"
        value={quantity}
        onChange={setQuantity}
        minValue={1}
        maxValue={10}
        description="Up to 10 per order."
        isAnimated
        className="self-start"
      />
    </div>
  );
}
