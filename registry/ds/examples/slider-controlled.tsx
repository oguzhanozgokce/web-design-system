'use client';

import { useState } from 'react';
import { useLocale } from 'react-aria-components';
import { Button } from '@/registry/ds/ui/button';
import { Slider } from '@/registry/ds/ui/slider';

const pricePerSeat = 12;

export default function SliderControlled() {
  const [seats, setSeats] = useState(8);
  const { locale } = useLocale();
  const monthly = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
    seats * pricePerSeat,
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Slider label="Seats" value={seats} onChange={setSeats} minValue={1} maxValue={50} />
      <div className="flex items-center justify-between gap-4">
        <p className="text-body-md text-on-surface-variant">
          <span className="text-title-md text-on-surface tabular-digits">{monthly}</span> per month
        </p>
        <Button variant="text" size="sm" onPress={() => setSeats(8)} isDisabled={seats === 8}>
          Reset
        </Button>
      </div>
    </div>
  );
}
