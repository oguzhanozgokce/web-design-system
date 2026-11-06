'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { NumberField } from '@/registry/ds/ui/number-field';

const nightlyRate = 145;

export default function NumberFieldControlled() {
  const { locale } = useLocale();
  const [nights, setNights] = useState(3);
  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
  const total = Number.isFinite(nights) ? nights * nightlyRate : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <NumberField label="Nights" value={nights} onChange={setNights} minValue={1} maxValue={28} />
      <p className="text-body-md text-on-surface-variant tabular-digits" aria-live="polite">
        {currency.format(nightlyRate)} a night, {currency.format(total)} in total
      </p>
    </div>
  );
}
